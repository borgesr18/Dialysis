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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    const resultado = await agendamentosService.buscarAgendamentoPorId(params.id, clinica_id);
    
    if (!resultado.data) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(resultado.data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    // Verificar se o agendamento existe e pertence à clínica
    const resultado = await agendamentosService.buscarAgendamentoPorId(params.id, clinica_id);
    
    if (!resultado.data) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o agendamento pode ser cancelado
    if (!resultado.data || ['cancelado', 'concluido'].includes(resultado.data.status)) {
      return NextResponse.json(
        { error: 'Agendamento não pode ser cancelado' },
        { status: 400 }
      );
    }

    // Verificação já feita acima

    // Cancelar o agendamento
    const agendamentoCancelado = await agendamentosService.cancelarAgendamento(params.id, 'Cancelado via API', clinica_id);
    
    return NextResponse.json({
      message: 'Agendamento cancelado com sucesso',
      agendamento: agendamentoCancelado
    });
  } catch (error) {
    return handleApiError(error);
  }
}