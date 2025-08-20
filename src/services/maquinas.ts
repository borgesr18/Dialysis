import { createClient } from '@/lib/supabase-client';
import { createAdminClient } from '@/lib/supabase-admin';
import { Database } from '@/types/database';
import { Maquina, MaquinaInsert, MaquinaUpdate } from '@/types/database';

export class MaquinasService {
  private supabase;
  private isServer: boolean;

  constructor(isServer = false) {
    this.isServer = isServer;
    this.supabase = isServer ? createAdminClient() : createClient();
  }

  // Listar todas as máquinas de uma clínica
  async listarMaquinas(clinicaId: string): Promise<{ data: Maquina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('numero', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar máquina por ID
  async buscarMaquinaPorId(id: string, clinicaId: string): Promise<{ data: Maquina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .select('*')
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar máquinas por número ou modelo
  async buscarMaquinas(termo: string, clinicaId: string): Promise<{ data: Maquina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .or(`numero.ilike.%${termo}%,modelo.ilike.%${termo}%,fabricante.ilike.%${termo}%`)
        .order('numero', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Listar máquinas por status
  async listarMaquinasPorStatus(status: 'ativa' | 'manutencao' | 'inativa', clinicaId: string): Promise<{ data: Maquina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .select('*')
        .eq('clinica_id', clinicaId)
        .eq('status', status)
        .order('numero', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar nova máquina
  async criarMaquina(maquina: MaquinaInsert): Promise<{ data: Maquina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .insert({
          ...maquina,
          status: maquina.status || 'ativa'
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar máquina
  async atualizarMaquina(id: string, maquina: MaquinaUpdate, clinicaId: string): Promise<{ data: Maquina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .update({
          ...maquina,
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

  // Alterar status da máquina
  async alterarStatusMaquina(id: string, status: 'ativa' | 'manutencao' | 'inativa', clinicaId: string): Promise<{ data: Maquina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .update({
          status,
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

  // Deletar máquina
  async deletarMaquina(id: string, clinicaId: string): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from('maquinas')
        .delete()
        .eq('id', id)
        .eq('clinica_id', clinicaId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Verificar se número da máquina já existe
  async verificarNumeroExistente(numero: string, clinicaId: string, excludeId?: string): Promise<{ exists: boolean; error: any }> {
    try {
      let query = this.supabase
        .from('maquinas')
        .select('id')
        .eq('clinica_id', clinicaId)
        .eq('numero', numero);

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

  // Contar máquinas por status
  async contarMaquinasPorStatus(clinicaId: string): Promise<{ 
    ativas: number; 
    manutencao: number; 
    inativas: number; 
    total: number; 
    error: any 
  }> {
    try {
      const { data, error } = await this.supabase
        .from('maquinas')
        .select('status')
        .eq('clinica_id', clinicaId);

      if (error) {
        return { ativas: 0, manutencao: 0, inativas: 0, total: 0, error };
      }

      const counts = {
        ativas: 0,
        manutencao: 0,
        inativas: 0,
        total: data?.length || 0
      };

      data?.forEach((maquina: any) => {
        if (maquina.status === 'ativa') counts.ativas++;
        else if (maquina.status === 'manutencao') counts.manutencao++;
        else if (maquina.status === 'inativa') counts.inativas++;
      });

      return { ...counts, error: null };
    } catch (error) {
      return { ativas: 0, manutencao: 0, inativas: 0, total: 0, error };
    }
  }

  // Listar máquinas com paginação
  async listarMaquinasPaginado(
    clinicaId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: 'ativa' | 'manutencao' | 'inativa'
  ): Promise<{ data: Maquina[] | null; count: number; error: any }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from('maquinas')
        .select('*', { count: 'exact' })
        .eq('clinica_id', clinicaId);

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.or(`numero.ilike.%${search}%,modelo.ilike.%${search}%,fabricante.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order('numero', { ascending: true })
        .range(offset, offset + limit - 1);

      return { data, count: count || 0, error };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }
}

// Instância para uso no cliente
export const maquinasService = new MaquinasService(false);

// Instância para uso no servidor
export const maquinasServerService = new MaquinasService(true);

// Funções de conveniência para server actions
export async function listarMaquinas(clinicaId: string) {
  return await maquinasServerService.listarMaquinas(clinicaId);
}

export async function buscarMaquinaPorId(id: string, clinicaId: string) {
  return await maquinasServerService.buscarMaquinaPorId(id, clinicaId);
}

export async function criarMaquina(maquina: MaquinaInsert) {
  return await maquinasServerService.criarMaquina(maquina);
}

export async function atualizarMaquina(id: string, maquina: MaquinaUpdate, clinicaId: string) {
  return await maquinasServerService.atualizarMaquina(id, maquina, clinicaId);
}

export async function alterarStatusMaquina(id: string, status: 'ativa' | 'manutencao' | 'inativa', clinicaId: string) {
  return await maquinasServerService.alterarStatusMaquina(id, status, clinicaId);
}

export async function deletarMaquina(id: string, clinicaId: string) {
  return await maquinasServerService.deletarMaquina(id, clinicaId);
}