import { Database } from '@/types/database';
import { createClient } from '@/lib/supabase-client';
import { Turno, TurnoInsert, TurnoUpdate } from '@/types/database';

export class TurnosService {
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

  // Listar todos os turnos de uma clínica
  async listarTurnos(clinicaId: string): Promise<{ data: Turno[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Listar apenas turnos ativos
  async listarTurnosAtivos(clinicaId: string): Promise<{ data: Turno[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar turno por ID
  async buscarTurnoPorId(id: string, clinicaId: string): Promise<{ data: Turno | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar turnos por nome
  async buscarTurnosPorNome(nome: string, clinicaId: string): Promise<{ data: Turno[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('clinica_id', clinicaId)
        .ilike('nome', `%${nome}%`)
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar turnos por dia da semana
  async buscarTurnosPorDia(diaSemana: number, clinicaId: string): Promise<{ data: Turno[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .contains('dias_semana', [diaSemana])
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar novo turno
  async criarTurno(turno: TurnoInsert): Promise<{ data: Turno | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .insert({
          ...turno,
          ativo: turno.ativo !== undefined ? turno.ativo : true
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar turno
  async atualizarTurno(id: string, turno: TurnoUpdate, clinicaId: string): Promise<{ data: Turno | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .update({
          ...turno,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Ativar/Desativar turno
  async alterarStatusTurno(id: string, ativo: boolean, clinicaId: string): Promise<{ data: Turno | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .update({
          ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Deletar turno
  async deletarTurno(id: string, clinicaId: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('turnos')
        .delete()
        .eq('id', id)
        .eq('clinica_id', clinicaId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Verificar se nome do turno já existe
  async verificarNomeExistente(nome: string, clinicaId: string, excludeId?: string): Promise<{ exists: boolean; error: any }> {
    try {
      let query = this.supabase
        .from('turnos')
        .select('id')
        .eq('clinica_id', clinicaId)
        .ilike('nome', nome);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        return { exists: false, error };
      }

      return { exists: data && data.length > 0, error: null };
    } catch (error) {
      return { exists: false, error };
    }
  }

  // Verificar conflito de horários
  async verificarConflitoHorario(
    horaInicio: string,
    horaFim: string,
    diasSemana: number[],
    clinicaId: string,
    excludeId?: string
  ): Promise<{ conflito: boolean; turnosConflitantes: Turno[]; error: any }> {
    try {
      let query = this.supabase
        .from('turnos')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        return { conflito: false, turnosConflitantes: [], error };
      }

      const turnosConflitantes: Turno[] = [];

      data?.forEach((turno: any) => {
        // Verificar se há dias em comum
        const diasComuns = turno.dias_semana.some((dia: string) => diasSemana.includes(Number(dia)));
        
        if (diasComuns) {
          // Verificar se há sobreposição de horários
          const inicioTurno = turno.hora_inicio;
          const fimTurno = turno.hora_fim;
          
          const haConflito = (
            (horaInicio >= inicioTurno && horaInicio < fimTurno) ||
            (horaFim > inicioTurno && horaFim <= fimTurno) ||
            (horaInicio <= inicioTurno && horaFim >= fimTurno)
          );
          
          if (haConflito) {
            turnosConflitantes.push(turno);
          }
        }
      });

      return {
        conflito: turnosConflitantes.length > 0,
        turnosConflitantes,
        error: null
      };
    } catch (error) {
      return { conflito: false, turnosConflitantes: [], error };
    }
  }

  // Contar turnos ativos e inativos
  async contarTurnos(clinicaId: string): Promise<{ 
    ativos: number; 
    inativos: number; 
    total: number; 
    error: any 
  }> {
    try {
      const { data, error } = await this.supabase
        .from('turnos')
        .select('ativo')
        .eq('clinica_id', clinicaId);

      if (error) {
        return { ativos: 0, inativos: 0, total: 0, error };
      }

      const counts = {
        ativos: 0,
        inativos: 0,
        total: data?.length || 0
      };

      data?.forEach((turno: any) => {
        if (turno.ativo) counts.ativos++;
        else counts.inativos++;
      });

      return { ...counts, error: null };
    } catch (error) {
      return { ativos: 0, inativos: 0, total: 0, error };
    }
  }

  // Listar turnos com paginação
  async listarTurnosPaginado(
    clinicaId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    apenasAtivos?: boolean
  ): Promise<{ data: Turno[] | null; count: number; error: any }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from('turnos')
        .select('*', { count: 'exact' })
        .eq('clinica_id', clinicaId);

      if (apenasAtivos) {
        query = query.eq('ativo', true);
      }

      if (search) {
        query = query.ilike('nome', `%${search}%`);
      }

      const { data, count, error } = await query
        .order('hora_inicio', { ascending: true })
        .range(offset, offset + limit - 1);

      return { data, count: count || 0, error };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }

  // Verificar disponibilidade do turno (se não está sendo usado em escalas ativas)
  async verificarDisponibilidadeTurno(id: string, clinicaId: string): Promise<{ disponivel: boolean; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('escala_pacientes')
        .select('id')
        .eq('turno_id', id)
        .eq('clinica_id', clinicaId)
        .eq('ativa', true)
        .limit(1);

      if (error) {
        return { disponivel: false, error };
      }

      return { disponivel: !data || data.length === 0, error: null };
    } catch (error) {
      return { disponivel: false, error };
    }
  }

  // Obter turnos do dia atual
  async obterTurnosDoDia(clinicaId: string): Promise<{ data: Turno[] | null; error: any }> {
    try {
      const hoje = new Date().getDay(); // 0 = domingo, 1 = segunda, etc.
      
      const { data, error } = await this.supabase
        .from('turnos')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .contains('dias_semana', [hoje])
        .order('hora_inicio', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Instância para uso no cliente
export const turnosService = new TurnosService(false);

// Instância para uso no servidor
export const turnosServerService = new TurnosService(true);

// Funções de conveniência para server actions
export async function listarTurnos(clinicaId: string) {
  return await turnosServerService.listarTurnos(clinicaId);
}

export async function listarTurnosAtivos(clinicaId: string) {
  return await turnosServerService.listarTurnosAtivos(clinicaId);
}

export async function buscarTurnoPorId(id: string, clinicaId: string) {
  return await turnosServerService.buscarTurnoPorId(id, clinicaId);
}

export async function criarTurno(turno: TurnoInsert) {
  return await turnosServerService.criarTurno(turno);
}

export async function atualizarTurno(id: string, turno: TurnoUpdate, clinicaId: string) {
  return await turnosServerService.atualizarTurno(id, turno, clinicaId);
}

export async function alterarStatusTurno(id: string, ativo: boolean, clinicaId: string) {
  return await turnosServerService.alterarStatusTurno(id, ativo, clinicaId);
}

export async function deletarTurno(id: string, clinicaId: string) {
  return await turnosServerService.deletarTurno(id, clinicaId);
}

export async function obterTurnosDoDia(clinicaId: string) {
  return await turnosServerService.obterTurnosDoDia(clinicaId);
}