import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { agendamentosService } from '@/services/agendamentos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function handleApiError(error: unknown) {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : 'Erro interno do servidor';
  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    // Verificar se o agendamento existe e pertence à clínica
    const resultado = await agendamentosService.buscarAgendamentoPorId(params.id, clinica_id);
    
    if (!resultado.data || ['cancelado', 'concluido', 'confirmado'].includes(resultado.data.status)) {
      return NextResponse.json(
        { error: 'Agendamento não pode ser confirmado' },
        { status: 400 }
      );
    }

    // Confirmar o agendamento
    const agendamentoConfirmado = await agendamentosService.confirmarAgendamento(params.id, clinica_id);
    
    return NextResponse.json({
      message: 'Agendamento confirmado com sucesso',
      agendamento: agendamentoConfirmado
    });
  } catch (error) {
    return handleApiError(error);
  }
}