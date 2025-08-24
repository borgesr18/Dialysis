import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { requireCurrentClinicId } from '@/lib/get-clinic';
import { agendamentosService } from '@/services/agendamentos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import type { CriarAgendamentoRequest, AtualizarAgendamentoRequest, FiltrosAgendamento, StatusAgendamento } from '@/shared/types';

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
    
    // Construir filtros a partir dos parâmetros da URL
    const data_inicio_str = searchParams.get('data_inicio');
    const data_fim_str = searchParams.get('data_fim');
    const paciente_id = searchParams.get('paciente_id') || undefined;
    const maquina_id = searchParams.get('maquina_id') || undefined;
    const turno_id = searchParams.get('turno_id') || undefined;
    const status = searchParams.get('status') || undefined;
    
    const filtros: FiltrosAgendamento = {
      dataInicio: data_inicio_str ? new Date(data_inicio_str) : undefined,
      dataFim: data_fim_str ? new Date(data_fim_str) : undefined,
      pacienteId: paciente_id,
      maquinaId: maquina_id,
      turnoId: turno_id,
      status: status as StatusAgendamento || undefined
    };

    // Remover propriedades undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key as keyof FiltrosAgendamento] === undefined) {
        delete filtros[key as keyof FiltrosAgendamento];
      }
    });

    const agendamentos = await agendamentosService.listarAgendamentos(clinica_id, filtros);
    
    return NextResponse.json(agendamentos);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    const body = await request.json();
    
    // Validar dados obrigatórios
    if (!body.paciente_id || !body.maquina_id || !body.data_agendamento || !body.hora_inicio || !body.duracao_minutos) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: paciente_id, maquina_id, data_agendamento, hora_inicio, duracao_minutos' },
        { status: 400 }
      );
    }

    const dadosAgendamento: CriarAgendamentoRequest = {
      ...body,
      clinica_id
    };

    const novoAgendamento = await agendamentosService.criarAgendamento(dadosAgendamento);
    
    return NextResponse.json(novoAgendamento, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const clinica_id = await requireCurrentClinicId();
    
    const body = await request.json();
    const { id, ...dadosAtualizacao } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o agendamento existe e pertence à clínica
    const agendamentoExistente = await agendamentosService.buscarAgendamentoPorId(id, clinica_id);
    
    if (!agendamentoExistente.data) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      );
    }

    // Verificar conflitos se dados relacionados a horários forem alterados
    if (dadosAtualizacao.data_agendamento || 
        dadosAtualizacao.hora_inicio || 
        dadosAtualizacao.maquina_id || 
        dadosAtualizacao.paciente_id ||
        dadosAtualizacao.duracao_minutos) {
      
      const dataHora = new Date(`${dadosAtualizacao.data_agendamento || agendamentoExistente.data.data_agendamento}T${dadosAtualizacao.hora_inicio || agendamentoExistente.data.hora_inicio}`);
      const conflitos = await agendamentosService.verificarConflitos(
        dataHora,
        dadosAtualizacao.maquina_id || agendamentoExistente.data.maquina_id,
        dadosAtualizacao.paciente_id || agendamentoExistente.data.paciente_id,
        id
      );

      if (conflitos.conflitoPaciente || conflitos.conflitoMaquina) {
        return NextResponse.json(
          { 
            error: 'Conflito de agendamento detectado',
            detalhes: conflitos
          },
          { status: 409 }
        );
      }
    }

    const agendamentoAtualizado = await agendamentosService.atualizarAgendamento(id, dadosAtualizacao, clinica_id);
    
    return NextResponse.json(agendamentoAtualizado);
  } catch (error) {
    return handleApiError(error);
  }
}