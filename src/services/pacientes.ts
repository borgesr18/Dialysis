import { createClient } from '@/lib/supabase-client';
import { Paciente, PacienteInsert, PacienteUpdate } from '@/types/database';

export class PacientesService {
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

  // Listar todos os pacientes de uma clínica
  async listarPacientes(clinicaId: string): Promise<{ data: Paciente[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('pacientes')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('nome_completo', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar paciente por ID
  async buscarPacientePorId(id: string, clinicaId: string): Promise<{ data: Paciente | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar pacientes por nome (busca)
  async buscarPacientesPorNome(nome: string, clinicaId: string): Promise<{ data: Paciente[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('pacientes')
        .select('*')
        .eq('clinica_id', clinicaId)
        .ilike('nome_completo', `%${nome}%`)
        .order('nome_completo', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar novo paciente
  async criarPaciente(paciente: PacienteInsert): Promise<{ data: Paciente | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('pacientes')
        .insert(paciente)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar paciente
  async atualizarPaciente(id: string, paciente: PacienteUpdate, clinicaId: string): Promise<{ data: Paciente | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('pacientes')
        .update({
          ...paciente,
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

  // Desativar paciente (soft delete)
  async desativarPaciente(id: string, clinicaId: string): Promise<{ data: Paciente | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('pacientes')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('clinica_id', clinicaId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Reativar paciente
  async reativarPaciente(id: string, clinicaId: string): Promise<{ data: Paciente | null; error: any }> {
    try {
      // Método não aplicável - pacientes não podem ser reativados após exclusão
       return { data: null, error: new Error('Operação não suportada') };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Verificar se CPF já existe
  async verificarCpfExistente(cpf: string, clinicaId: string, excludeId?: string): Promise<{ exists: boolean; error: any }> {
    try {
      let query = this.supabase
        .from('pacientes')
        .select('id')
        .eq('clinica_id', clinicaId)
        .eq('cpf', cpf);

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

  // Contar total de pacientes ativos
  async contarPacientesAtivos(clinicaId: string): Promise<{ count: number; error: any }> {
    try {
      const { count, error } = await this.supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('clinica_id', clinicaId);

      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error };
    }
  }

  // Listar pacientes com paginação
  async listarPacientesPaginado(
    clinicaId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ data: Paciente[] | null; count: number; error: any }> {
    try {
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from('pacientes')
        .select('*', { count: 'exact' })
        .eq('clinica_id', clinicaId);

      if (search) {
        query = query.or(`nome_completo.ilike.%${search}%,cpf.ilike.%${search}%`);
      }

      const { data, count, error } = await query
        .order('nome_completo', { ascending: true })
        .range(offset, offset + limit - 1);

      return { data, count: count || 0, error };
    } catch (error) {
      return { data: null, count: 0, error };
    }
  }
}

// Instância para uso no cliente
export const pacientesService = new PacientesService(false);

// Instância para uso no servidor
export const pacientesServerService = new PacientesService(true);

// Funções de conveniência para server actions
export async function listarPacientes(clinicaId: string) {
  return await pacientesServerService.listarPacientes(clinicaId);
}

export async function buscarPacientePorId(id: string, clinicaId: string) {
  return await pacientesServerService.buscarPacientePorId(id, clinicaId);
}

export async function criarPaciente(paciente: PacienteInsert) {
  return await pacientesServerService.criarPaciente(paciente);
}

export async function atualizarPaciente(id: string, paciente: PacienteUpdate, clinicaId: string) {
  return await pacientesServerService.atualizarPaciente(id, paciente, clinicaId);
}

export async function desativarPaciente(id: string, clinicaId: string) {
  return await pacientesServerService.desativarPaciente(id, clinicaId);
}