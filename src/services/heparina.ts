import { createClient } from '@/lib/supabase-client';
import { 
  DoseHeparina, 
  DoseHeparinaInsert, 
  DoseHeparinaUpdate,
  HistoricoAlteracaoDose,
  AlertaHeparina,
  AlertaHeparinaInsert,
  AlertaHeparinaUpdate,
  ConfiguracaoAlerta,
  ConfiguracaoAlertaUpdate
} from '@/types/database';

export class HeparinaService {
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

  // ============================================================================
  // DOSES DE HEPARINA
  // ============================================================================

  // Listar doses de heparina por clínica
  async listarDoses(clinicaId: string): Promise<{ data: DoseHeparina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('doses_heparina')
        .select(`
          *,
          pacientes!inner(
            id,
            nome_completo,
            registro
          )
        `)
        .eq('clinica_id', clinicaId)
        .order('data_prescricao', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar doses por paciente
  async buscarDosesPorPaciente(pacienteId: string, clinicaId: string): Promise<{ data: DoseHeparina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('doses_heparina')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('clinica_id', clinicaId)
        .order('data_prescricao', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar dose por ID
  async buscarDose(id: string): Promise<DoseHeparina | null> {
    const { data, error } = await this.supabase
      .from('doses_heparina')
      .select(`
        *,
        pacientes(nome, cpf),
        sessoes_hemodialise(data_sessao)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar dose:', error);
      return null;
    }

    return data;
  }

  // Buscar dose atual do paciente
  async buscarDoseAtual(pacienteId: string, clinicaId: string): Promise<{ data: DoseHeparina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('doses_heparina')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('clinica_id', clinicaId)
        .eq('ativo', true)
        .order('data_prescricao', { ascending: false })
        .limit(1)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar nova dose
  async criarDose(dose: DoseHeparinaInsert): Promise<{ data: DoseHeparina | null; error: any }> {
    try {
      // Verificar se existe dose ativa para o mesmo paciente
      const { data: doseAtiva } = await this.supabase
        .from('doses_heparina')
        .select('id')
        .eq('paciente_id', dose.paciente_id)
        .eq('aplicada', false)
        .eq('clinica_id', dose.clinica_id)
        .single();

      // Se existe dose ativa, desativar
      if (doseAtiva) {
        await this.supabase
          .from('doses_heparina')
          .update({ aplicada: true })
          .eq('id', doseAtiva.id);
      }

      const { data, error } = await this.supabase
        .from('doses_heparina')
        .insert(dose)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar dose
  async atualizarDose(id: string, dose: DoseHeparinaUpdate, clinicaId: string): Promise<{ data: DoseHeparina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('doses_heparina')
        .update({
          ...dose,
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

  // Desativar dose
  async desativarDose(id: string, clinicaId: string): Promise<{ data: DoseHeparina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('doses_heparina')
        .update({
          ativo: false,
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

  // ============================================================================
  // ALERTAS DE HEPARINA
  // ============================================================================

  // Listar alertas
  async listarAlertas(filtros?: {
    ativo?: boolean;
    severidade?: string;
    paciente_id?: string;
    clinica_id?: string;
  }): Promise<AlertaHeparina[]> {
    let query = this.supabase
      .from('alertas_heparina')
      .select(`
        *,
        pacientes(nome, cpf),
        doses_heparina(dose_heparina, tipo_acesso)
      `)
      .order('data_criacao', { ascending: false });

    if (filtros?.ativo !== undefined) {
      query = query.eq('ativo', filtros.ativo);
    }

    if (filtros?.severidade) {
      query = query.eq('severidade', filtros.severidade);
    }

    if (filtros?.paciente_id) {
      query = query.eq('paciente_id', filtros.paciente_id);
    }

    if (filtros?.clinica_id) {
      query = query.eq('clinica_id', filtros.clinica_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar alertas:', error);
      return [];
    }

    return data || [];
  }

  // Listar alertas ativos
  async listarAlertasAtivos(clinicaId: string): Promise<{ data: AlertaHeparina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alertas_heparina')
        .select(`
          *,
          pacientes!inner(
            id,
            nome_completo,
            registro
          ),
          doses_heparina!inner(
            id,
            dose_ui,
            unidade,
            tipo_acesso
          )
        `)
        .eq('clinica_id', clinicaId)
        .eq('resolvido', false)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar alertas por paciente
  async buscarAlertasPorPaciente(pacienteId: string, clinicaId: string): Promise<{ data: AlertaHeparina[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alertas_heparina')
        .select('*')
        .eq('paciente_id', pacienteId)
        .eq('clinica_id', clinicaId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Criar alerta
  async criarAlerta(alerta: AlertaHeparinaInsert): Promise<{ data: AlertaHeparina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alertas_heparina')
        .insert(alerta)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Resolver alerta
  async resolverAlerta(id: string, usuario_id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('alertas_heparina')
      .update({
        ativo: false,
        resolvido_em: new Date().toISOString(),
        resolvido_por: usuario_id
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao resolver alerta:', error);
      return false;
    }

    return true;
  }

  // Resolver alerta (versão com retorno de dados)
  async resolverAlertaComDados(id: string, userId: string, clinicaId: string): Promise<{ data: AlertaHeparina | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('alertas_heparina')
        .update({
          resolvido: true,
          resolvido_por: userId,
          resolvido_em: new Date().toISOString(),
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

  // ============================================================================
  // HISTÓRICO DE ALTERAÇÕES
  // ============================================================================

  // Buscar histórico por dose
  async buscarHistoricoPorDose(doseId: string, clinicaId: string): Promise<{ data: HistoricoAlteracaoDose[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('historico_alteracoes_dose')
        .select('*')
        .eq('dose_id', doseId)
        .eq('clinica_id', clinicaId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Buscar histórico por paciente
  async buscarHistoricoPorPaciente(pacienteId: string, clinicaId: string): Promise<{ data: HistoricoAlteracaoDose[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('historico_alteracoes_dose')
        .select(`
          *,
          doses_heparina!inner(
            id,
            dose_ui,
            unidade,
            tipo_acesso
          )
        `)
        .eq('paciente_id', pacienteId)
        .eq('clinica_id', clinicaId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // ============================================================================
  // CONFIGURAÇÕES DE ALERTA
  // ============================================================================

  // Buscar configurações por tipo de acesso
  async buscarConfiguracoesPorTipo(tipoAcesso: string, clinicaId: string): Promise<{ data: ConfiguracaoAlerta | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('configuracoes_alerta')
        .select('*')
        .eq('tipo_acesso', tipoAcesso)
        .eq('clinica_id', clinicaId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Listar todas as configurações
  async listarConfiguracoes(clinicaId: string): Promise<{ data: ConfiguracaoAlerta[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('configuracoes_alerta')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('tipo_acesso', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Atualizar configuração
  async atualizarConfiguracao(id: string, config: ConfiguracaoAlertaUpdate, clinicaId: string): Promise<{ data: ConfiguracaoAlerta | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from('configuracoes_alerta')
        .update({
          ...config,
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

  // ============================================================================
  // MÉTODOS DE ANÁLISE E RELATÓRIOS
  // ============================================================================

  // Buscar estatísticas de doses
  async buscarEstatisticasDoses(clinicaId: string, dataInicio?: string, dataFim?: string): Promise<{ data: any | null; error: any }> {
    try {
      let query = this.supabase
        .from('doses_heparina')
        .select('dose_ui, unidade, tipo_acesso, data_prescricao')
        .eq('clinica_id', clinicaId)
        .eq('ativo', true);

      if (dataInicio) {
        query = query.gte('data_prescricao', dataInicio);
      }
      if (dataFim) {
        query = query.lte('data_prescricao', dataFim);
      }

      const { data, error } = await query;

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Verificar alertas pendentes
  async verificarAlertas(clinicaId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('verificar_alertas_dose', {
          p_clinica_id: clinicaId
        });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Instância para uso no cliente
export const heparinaService = new HeparinaService(false);

// Instância para uso no servidor
export const heparinaServerService = new HeparinaService(true);

// Funções de conveniência para server actions
export async function listarDoses(clinicaId: string) {
  return await heparinaServerService.listarDoses(clinicaId);
}

export async function buscarDosesPorPaciente(pacienteId: string, clinicaId: string) {
  return await heparinaServerService.buscarDosesPorPaciente(pacienteId, clinicaId);
}

export async function buscarDoseAtual(pacienteId: string, clinicaId: string) {
  return await heparinaServerService.buscarDoseAtual(pacienteId, clinicaId);
}

export async function criarDose(dose: DoseHeparinaInsert) {
  return await heparinaServerService.criarDose(dose);
}

export async function atualizarDose(id: string, dose: DoseHeparinaUpdate, clinicaId: string) {
  return await heparinaServerService.atualizarDose(id, dose, clinicaId);
}

export async function listarAlertasAtivos(clinicaId: string) {
  return await heparinaServerService.listarAlertasAtivos(clinicaId);
}

export async function resolverAlerta(id: string, userId: string) {
  return await heparinaServerService.resolverAlerta(id, userId);
}

export async function buscarHistoricoPorPaciente(pacienteId: string, clinicaId: string) {
  return await heparinaServerService.buscarHistoricoPorPaciente(pacienteId, clinicaId);
}

export async function listarConfiguracoes(clinicaId: string) {
  return await heparinaServerService.listarConfiguracoes(clinicaId);
}

export async function atualizarConfiguracao(id: string, config: ConfiguracaoAlertaUpdate, clinicaId: string) {
  return await heparinaServerService.atualizarConfiguracao(id, config, clinicaId);
}

export async function buscarEstatisticasDoses(clinicaId: string, dataInicio?: string, dataFim?: string) {
  return await heparinaServerService.buscarEstatisticasDoses(clinicaId, dataInicio, dataFim);
}

export async function verificarAlertas(clinicaId: string) {
  return await heparinaServerService.verificarAlertas(clinicaId);
}