import { createClient } from '@/lib/supabase-server';

// Tipos de ações para auditoria do módulo Heparina
export type HeparinaAuditAction = 
  | 'dose_criada'
  | 'dose_atualizada'
  | 'dose_aplicada'
  | 'alerta_criado'
  | 'alerta_resolvido'
  | 'alerta_atualizado'
  | 'configuracao_criada'
  | 'configuracao_atualizada'
  | 'configuracao_desativada'
  | 'historico_criado';

// Interface para dados de auditoria
interface HeparinaAuditData {
  action: HeparinaAuditAction;
  table_name: string;
  record_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  user_id: string;
  clinica_id: string;
  metadata?: Record<string, any>;
}

// Função para criar log de auditoria
export async function createHeparinaAuditLog(data: HeparinaAuditData): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const auditEntry = {
      tabela: data.table_name,
      operacao: data.action,
      registro_id: data.record_id,
      valores_antigos: data.old_values || null,
      valores_novos: data.new_values || null,
      usuario_id: data.user_id,
      clinica_id: data.clinica_id,
      metadata: {
        modulo: 'heparina',
        ...data.metadata
      },
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('audit_log')
      .insert(auditEntry);

    if (error) {
      console.error('Erro ao criar log de auditoria:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
    return { success: false, error: 'Erro interno ao criar log de auditoria' };
  }
}

// Função específica para auditoria de doses
export async function auditDoseHeparina(
  action: 'dose_criada' | 'dose_atualizada' | 'dose_aplicada',
  doseId: string,
  userId: string,
  clinicaId: string,
  oldValues?: any,
  newValues?: any,
  metadata?: Record<string, any>
) {
  return createHeparinaAuditLog({
    action,
    table_name: 'doses_heparina',
    record_id: doseId,
    old_values: oldValues,
    new_values: newValues,
    user_id: userId,
    clinica_id: clinicaId,
    metadata: {
      tipo: 'dose_heparina',
      ...metadata
    }
  });
}

// Função específica para auditoria de alertas
export async function auditAlertaHeparina(
  action: 'alerta_criado' | 'alerta_resolvido' | 'alerta_atualizado',
  alertaId: string,
  userId: string,
  clinicaId: string,
  oldValues?: any,
  newValues?: any,
  metadata?: Record<string, any>
) {
  return createHeparinaAuditLog({
    action,
    table_name: 'alertas_heparina',
    record_id: alertaId,
    old_values: oldValues,
    new_values: newValues,
    user_id: userId,
    clinica_id: clinicaId,
    metadata: {
      tipo: 'alerta_heparina',
      ...metadata
    }
  });
}

// Função específica para auditoria de configurações
export async function auditConfiguracaoAlerta(
  action: 'configuracao_criada' | 'configuracao_atualizada' | 'configuracao_desativada',
  configId: string,
  userId: string,
  clinicaId: string,
  oldValues?: any,
  newValues?: any,
  metadata?: Record<string, any>
) {
  return createHeparinaAuditLog({
    action,
    table_name: 'configuracoes_alerta',
    record_id: configId,
    old_values: oldValues,
    new_values: newValues,
    user_id: userId,
    clinica_id: clinicaId,
    metadata: {
      tipo: 'configuracao_alerta',
      ...metadata
    }
  });
}

// Função específica para auditoria de histórico
export async function auditHistoricoAlteracao(
  historicoId: string,
  userId: string,
  clinicaId: string,
  doseHeparinaId: string,
  doseAnterior?: number,
  doseNova?: number,
  motivo?: string
) {
  return createHeparinaAuditLog({
    action: 'historico_criado',
    table_name: 'historico_alteracoes_dose',
    record_id: historicoId,
    new_values: {
      dose_heparina_id: doseHeparinaId,
      dose_anterior: doseAnterior,
      dose_nova: doseNova,
      motivo_alteracao: motivo
    },
    user_id: userId,
    clinica_id: clinicaId,
    metadata: {
      tipo: 'historico_alteracao',
      dose_heparina_id: doseHeparinaId
    }
  });
}

// Alias para compatibilidade
export const auditHistoricoHeparina = auditHistoricoAlteracao;

// Função para buscar logs de auditoria do módulo Heparina
export async function getHeparinaAuditLogs(
  clinicaId: string,
  filters?: {
    table_name?: string;
    record_id?: string;
    user_id?: string;
    action?: HeparinaAuditAction;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('audit_log')
      .select(`
        *,
        users(email)
      `)
      .eq('clinica_id', clinicaId)
      .eq('metadata->>modulo', 'heparina')
      .order('timestamp', { ascending: false });

    if (filters?.table_name) {
      query = query.eq('tabela', filters.table_name);
    }

    if (filters?.record_id) {
      query = query.eq('registro_id', filters.record_id);
    }

    if (filters?.user_id) {
      query = query.eq('usuario_id', filters.user_id);
    }

    if (filters?.action) {
      query = query.eq('operacao', filters.action);
    }

    if (filters?.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return { success: false, error: 'Erro interno ao buscar logs de auditoria' };
  }
}