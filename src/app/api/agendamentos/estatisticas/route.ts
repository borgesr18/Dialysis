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

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    const { searchParams } = new URL(request.url);
    
    // Parâmetros opcionais para filtrar período
    const data_inicio_str = searchParams.get('data_inicio');
    const data_fim_str = searchParams.get('data_fim');
    
    const dataInicio = data_inicio_str ? new Date(data_inicio_str) : undefined;
    const dataFim = data_fim_str ? new Date(data_fim_str) : undefined;
    
    const resultado = await agendamentosService.contarAgendamentosPorStatus(
      clinica_id,
      dataInicio,
      dataFim
    );

    if (!resultado.data) {
      return NextResponse.json(
        { error: 'Erro ao obter estatísticas' },
        { status: 500 }
      );
    }

    // Calcular total e percentuais
    const total = Object.values(resultado.data).reduce((acc, count) => acc + count, 0);
    
    const estatisticasComPercentual = Object.entries(resultado.data).map(([status, count]) => ({
      status,
      total: count,
      percentual: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    return NextResponse.json({
      total,
      por_status: estatisticasComPercentual
    });
  } catch (error) {
    return handleApiError(error);
  }
}