import { createClient } from '@/lib/supabase-client';
import { 
  AgendamentoSessao, 
  CriarAgendamentoRequest, 
  AtualizarAgendamentoRequest,
  StatusAgendamento,
  FiltrosAgendamento,
  ConflitosAgendamento,
  SlotDisponivel
} from '@/shared/types';
import { addMinutes, format, startOfDay, endOfDay, parseISO } from 'date-fns';

export class AgendamentosService {
  private supabase;
  private isServer: boolean;

  constructor(isServer = false) {
    this.isServer = isServer;
    if (isServer && typeof window === 'undefined') {
      // Importação dinâmica apenas no servidor
      const { createAdminClient } = require('@/lib/supabase-admin');
      this.supabase = createAdminClient();
    } else {
      this.supabase = createClient();
    }
  }

  // Listar agendamentos com filtros
  async listarAgendamentos(
    clinicaId: string,
    filtros?: FiltrosAgendamento
  ): Promise<{ data: AgendamentoSessao[] | null; error: any }> {
    try {
      let query = this.supabase
        .from('sessoes_hemodialise')
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .eq('clinica_id', clinicaId);

      // Aplicar filtros
      if (filtros) {
        if (filtros.dataInicio) {
          query = query.gte('data_agendamento', filtros.dataInicio);
        }
        
        if (filtros.dataFim) {
          query = query.lte('data_agendamento', filtros.dataFim);
        }
        
        if (filtros.pacienteId) {
          query = query.eq('paciente_id', filtros.pacienteId);
        }
        
        if (filtros.maquinaId) {
          query = query.eq('maquina_id', filtros.maquinaId);
        }
        
        if (filtros.turnoId) {
          query = query.eq('turno_id', filtros.turnoId);
        }
        
        if (filtros.status && filtros.status.length > 0) {
          query = query.in('status', filtros.status);
        }
      }

      const { data, error } = await query
        .order('data_agendamento', { ascending: true })
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar agendamento por ID
  async buscarAgendamentoPorId(
    id: string, 
    clinicaId: string
  ): Promise<{ data: AgendamentoSessao | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('sessoes_hemodialise')
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar novo agendamento
  async criarAgendamento(
    agendamento: CriarAgendamentoRequest
  ): Promise<{ data: AgendamentoSessao | null; error: any }> {
    try {
      // Verificar conflitos antes de criar
      const dataHora = new Date(`${agendamento.data_agendamento}T${agendamento.hora_inicio}`);
      const conflitos = await this.verificarConflitos(
        dataHora,
        agendamento.maquina_id,
        agendamento.paciente_id
      );

      if (conflitos.conflitoPaciente || conflitos.conflitoMaquina) {
        return {
          data: null,
          error: {
            message: 'Conflito de agendamento detectado',
            details: conflitos
          }
        };
      }

      const { data, error } = await this.supabase
        .from('sessoes_hemodialise')
        .insert({
          ...agendamento,
          status: 'agendado' as StatusAgendamento,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar agendamento
  async atualizarAgendamento(
    id: string,
    agendamento: AtualizarAgendamentoRequest,
    clinicaId: string
  ): Promise<{ data: AgendamentoSessao | null; error: any }> {
    try {
      // Verificar conflitos antes de atualizar (excluindo o próprio agendamento)
      if (agendamento.data_agendamento && agendamento.hora_inicio) {
        const dataHora = new Date(`${agendamento.data_agendamento}T${agendamento.hora_inicio}`);
        const conflitos = await this.verificarConflitos(
          dataHora,
          agendamento.maquina_id!,
          agendamento.paciente_id!,
          id
        );

        if (conflitos.conflitoPaciente || conflitos.conflitoMaquina) {
          return {
            data: null,
            error: {
              message: 'Conflito de agendamento detectado',
              details: conflitos
            }
          };
        }
      }

      const { data, error } = await this.supabase
        .from('sessoes_hemodialise')
        .update({
          ...agendamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Cancelar agendamento
  async cancelarAgendamento(
    id: string,
    motivo: string,
    clinicaId: string
  ): Promise<{ data: AgendamentoSessao | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('sessoes_hemodialise')
        .update({
          status: 'cancelado' as StatusAgendamento,
          observacoes: motivo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Confirmar agendamento
  async confirmarAgendamento(
    id: string,
    clinicaId: string
  ): Promise<{ data: AgendamentoSessao | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('sessoes_hemodialise')
        .update({
          status: 'confirmado' as StatusAgendamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Verificar conflitos de agendamento
  async verificarConflitos(
    dataHora: Date,
    maquinaId: string,
    pacienteId: string,
    excludeId?: string
  ): Promise<ConflitosAgendamento> {
    try {
      const dataAgendamento = format(dataHora, 'yyyy-MM-dd');
      const horaInicio = format(dataHora, 'HH:mm');

      let query = this.supabase
        .from('sessoes_hemodialise')
        .select('id, paciente_id, maquina_id, hora_inicio, hora_fim')
        .eq('data_agendamento', dataAgendamento)
        .in('status', ['agendado', 'confirmado', 'em_andamento']);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data: agendamentosExistentes, error } = await query;

      if (error) {
        throw error;
      }

      let conflitoPaciente = false;
      let conflitoMaquina = false;

      if (agendamentosExistentes) {
        for (const agendamento of agendamentosExistentes) {
          // Verificar sobreposição de horários
          const inicioExistente = agendamento.hora_inicio;
          const fimExistente = agendamento.hora_fim;

          if (this.horariosSesobrepoe(horaInicio, horaInicio, inicioExistente, fimExistente)) {
            if (agendamento.paciente_id === pacienteId) {
              conflitoPaciente = true;
            }
            if (agendamento.maquina_id === maquinaId) {
              conflitoMaquina = true;
            }
          }
        }
      }

      return {
        conflitoPaciente,
        conflitoMaquina
      };
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return {
        conflitoPaciente: false,
        conflitoMaquina: false
      };
    }
  }

  // Verificar se dois horários se sobrepõem
  private horariosSesobrepoe(
    inicio1: string,
    fim1: string,
    inicio2: string,
    fim2: string
  ): boolean {
    const start1 = new Date(`2000-01-01T${inicio1}`);
    const end1 = new Date(`2000-01-01T${fim1}`);
    const start2 = new Date(`2000-01-01T${inicio2}`);
    const end2 = new Date(`2000-01-01T${fim2}`);

    return start1 < end2 && end1 > start2;
  }

  // Obter slots disponíveis para uma data e turno
  async obterSlotsDisponiveis(
    clinicaId: string,
    data: string,
    turnoId: string,
    maquinaId?: string
  ): Promise<{ data: SlotDisponivel[] | null; error: any }> {
    try {
      // Buscar informações do turno
      const { data: turno, error: turnoError } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('id', turnoId)
        .single();

      if (turnoError || !turno) {
        return { data: null, error: turnoError || new Error('Turno não encontrado') };
      }

      // Buscar máquinas disponíveis
      let maquinasQuery = this.supabase
        .from('maquinas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('status', 'ativa');

      if (maquinaId) {
        maquinasQuery = maquinasQuery.eq('id', maquinaId);
      }

      const { data: maquinas, error: maquinasError } = await maquinasQuery;

      if (maquinasError) {
        return { data: null, error: maquinasError };
      }

      // Buscar agendamentos existentes para a data
      const { data: agendamentosExistentes, error: agendamentosError } = await this.supabase
        .from('sessoes_hemodialise')
        .select('maquina_id, hora_inicio, hora_fim')
        .eq('data_agendamento', data)
        .eq('turno_id', turnoId)
        .in('status', ['agendado', 'confirmado', 'em_andamento']);

      if (agendamentosError) {
        return { data: null, error: agendamentosError };
      }

      // Gerar slots disponíveis
      const slots: SlotDisponivel[] = [];
      const inicio = new Date(`2000-01-01T${turno.hora_inicio}`);
      const fim = new Date(`2000-01-01T${turno.hora_fim}`);

      if (maquinas) {
        for (const maquina of maquinas) {
          let atual = inicio;
          while (atual < fim) {
            const horaSlot = format(atual, 'HH:mm');
            
            // Verificar se o slot está ocupado
            const ocupado = agendamentosExistentes?.some((agendamento: any) => 
              agendamento.maquina_id === maquina.id &&
              this.horariosSesobrepoe(horaSlot, horaSlot, agendamento.hora_inicio, agendamento.hora_fim)
            ) || false;

            if (!ocupado) {
              slots.push({
                data: new Date(data),
                hora_inicio: horaSlot,
                hora_fim: format(addMinutes(new Date(`2000-01-01T${horaSlot}`), 240), 'HH:mm'), // 4 horas padrão
                turno_id: turnoId,
                turno_nome: turno.nome,
                maquinas_disponiveis: [maquina.id]
              });
            }

            atual = addMinutes(atual, 30); // Intervalos de 30 minutos
          }
        }
      }

      return { data: slots, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Obter agendamentos por período
  async obterAgendamentosPorPeriodo(
    clinicaId: string,
    dataInicio: Date,
    dataFim: Date
  ): Promise<{ data: AgendamentoSessao[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('sessoes_hemodialise')
        .select(`
          *,
          pacientes!inner(id, nome_completo, registro),
          maquinas!inner(id, identificador, modelo, ativa),
          turnos!inner(id, nome, hora_inicio, hora_fim)
        `)
        .eq('clinica_id', clinicaId)
        .gte('data_agendamento', format(dataInicio, 'yyyy-MM-dd'))
        .lte('data_agendamento', format(dataFim, 'yyyy-MM-dd'))
        .order('data_agendamento', { ascending: true })
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Contar agendamentos por status
  async contarAgendamentosPorStatus(
    clinicaId: string,
    dataInicio?: Date,
    dataFim?: Date
  ): Promise<{ data: Record<StatusAgendamento, number> | null; error: any }> {
    try {
      let query = this.supabase
        .from('sessoes_hemodialise')
        .select('status')
        .eq('clinica_id', clinicaId);

      if (dataInicio) {
        query = query.gte('data_agendamento', format(dataInicio, 'yyyy-MM-dd'));
      }

      if (dataFim) {
        query = query.lte('data_agendamento', format(dataFim, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error };
      }

      // Contar por status
      const contadores: Record<StatusAgendamento, number> = {
        agendado: 0,
        confirmado: 0,
        em_andamento: 0,
        concluido: 0,
        cancelado: 0,
        faltou: 0
      };

      if (data) {
        data.forEach((item: any) => {
          if (item.status in contadores) {
            contadores[item.status as StatusAgendamento]++;
          }
        });
      }

      return { data: contadores, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Instância para uso no cliente
export const agendamentosService = new AgendamentosService(false);

// Instância para uso no servidor
export const agendamentosServerService = new AgendamentosService(true);