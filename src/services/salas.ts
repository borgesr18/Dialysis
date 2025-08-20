import { createClient } from '@/lib/supabase-client';
import { createAdminClient } from '@/lib/supabase-admin';
import { Sala, SalaInsert, SalaUpdate } from '@/types/database';

export class SalasService {
  private supabase;
  private isServer: boolean;

  constructor(isServer = false) {
    this.isServer = isServer;
    this.supabase = isServer ? createAdminClient() : createClient();
  }

  // Listar todas as salas de uma clínica
  async listarSalas(clinicaId: string): Promise<{ data: Sala[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Listar apenas salas ativas
  async listarSalasAtivas(clinicaId: string): Promise<{ data: Sala[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('ativa', true)
        .order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar sala por ID
  async buscarSalaPorId(id: string, clinicaId: string): Promise<{ data: Sala | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .select('*')
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar salas por nome
  async buscarSalasPorNome(nome: string, clinicaId: string): Promise<{ data: Sala[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .ilike('nome', `%${nome}%`)
        .order('nome', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar nova sala
  async criarSala(sala: SalaInsert): Promise<{ data: Sala | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .insert({
          ...sala,
          ativa: sala.ativa !== undefined ? sala.ativa : true
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar sala
  async atualizarSala(id: string, sala: SalaUpdate, clinicaId: string): Promise<{ data: Sala | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .update({
          ...sala,
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

  // Ativar/Desativar sala
  async alterarStatusSala(id: string, ativa: boolean, clinicaId: string): Promise<{ data: Sala | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .update({
          ativa,
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

  // Deletar sala
  async deletarSala(id: string, clinicaId: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('salas')
        .delete()
        .eq('id', id)
        .eq('clinica_id', clinicaId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Verificar se nome da sala já existe
  async verificarNomeExistente(nome: string, clinicaId: string, excludeId?: string): Promise<{ exists: boolean; error: any }> {
    try {
      let query = this.supabase
        .from('salas')
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

  // Contar salas ativas e inativas
  async contarSalas(clinicaId: string): Promise<{ 
    ativas: number; 
    inativas: number; 
    total: number; 
    error: any 
  }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .select('ativa')
        .eq('clinica_id', clinicaId);

      if (error) {
        return { ativas: 0, inativas: 0, total: 0, error };
      }

      const counts = {
        ativas: 0,
        inativas: 0,
        total: data?.length || 0
      };

      data?.forEach((sala: any) => {
        if (sala.ativa) counts.ativas++;
        else counts.inativas++;
      });

      return { ...counts, error: null };
    } catch (error) {
      return { ativas: 0, inativas: 0, total: 0, error };
    }
  }

  // Calcular capacidade total das salas ativas
  async calcularCapacidadeTotal(clinicaId: string): Promise<{ capacidade: number; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('salas')
        .select('capacidade')
        .eq('clinica_id', clinicaId)
        .eq('ativa', true);

      if (error) {
        return { capacidade: 0, error };
      }

      const capacidadeTotal = data?.reduce((total: any, sala: any) => {
        return total + (sala.capacidade || 0);
      }, 0) || 0;

      return { capacidade: capacidadeTotal, error: null };
    } catch (error) {
      return { capacidade: 0, error };
    }
  }

  // Listar salas com paginação
  async listarSalasPaginado(
    clinicaId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    apenasAtivas?: boolean
  ): Promise<{ data: Sala[] | null; count: number; error: any }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from('salas')
        .select('*', { count: 'exact' })
        .eq('clinica_id', clinicaId);

      if (apenasAtivas) {
        query = query.eq('ativa', true);
      }

      if (search) {
        query = query.or(`nome.ilike.%${search}%,descricao.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order('nome', { ascending: true })
        .range(offset, offset + limit - 1);

      return { data, count: count || 0, error };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }

  // Verificar disponibilidade da sala (se não está sendo usada em escalas ativas)
  async verificarDisponibilidadeSala(id: string, clinicaId: string): Promise<{ disponivel: boolean; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('escala_pacientes')
        .select('id')
        .eq('sala_id', id)
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
}

// Instância para uso no cliente
export const salasService = new SalasService(false);

// Instância para uso no servidor
export const salasServerService = new SalasService(true);

// Funções de conveniência para server actions
export async function listarSalas(clinicaId: string) {
  return await salasServerService.listarSalas(clinicaId);
}

export async function listarSalasAtivas(clinicaId: string) {
  return await salasServerService.listarSalasAtivas(clinicaId);
}

export async function buscarSalaPorId(id: string, clinicaId: string) {
  return await salasServerService.buscarSalaPorId(id, clinicaId);
}

export async function criarSala(sala: SalaInsert) {
  return await salasServerService.criarSala(sala);
}

export async function atualizarSala(id: string, sala: SalaUpdate, clinicaId: string) {
  return await salasServerService.atualizarSala(id, sala, clinicaId);
}

export async function alterarStatusSala(id: string, ativa: boolean, clinicaId: string) {
  return await salasServerService.alterarStatusSala(id, ativa, clinicaId);
}

export async function deletarSala(id: string, clinicaId: string) {
  return await salasServerService.deletarSala(id, clinicaId);
}