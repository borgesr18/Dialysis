import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { agendamentosService } from '@/services/agendamentos';

function handleApiError(error: unknown) {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'Erro interno do servidor';
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    const { searchParams } = new URL(request.url);
    
    // Parâmetros obrigatórios
    const data = searchParams.get('data');
    const turno_id = searchParams.get('turno_id');
    const maquina_id = searchParams.get('maquina_id');

    if (!data) {
      return NextResponse.json(
        { error: 'Parâmetro data é obrigatório' },
        { status: 400 }
      );
    }

    if (!turno_id) {
      return NextResponse.json(
        { error: 'Parâmetro turno_id é obrigatório' },
        { status: 400 }
      );
    }

    const resultado = await agendamentosService.obterSlotsDisponiveis(
      clinica_id,
      data,
      turno_id,
      maquina_id || undefined
    );
    
    return NextResponse.json(resultado.data);
  } catch (error) {
    return handleApiError(error);
  }
}