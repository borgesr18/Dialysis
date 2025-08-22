import { createClient } from './supabase-server';
import { cache } from 'react';

// Cache da função para evitar múltiplas consultas na mesma requisição
const getCachedClinicId = cache(async (): Promise<string | null> => {
  const supabase = createClient();
  
  try {
    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('⚠️ Erro ao verificar usuário:', userError.message);
      return null;
    }

    if (!user) {
      console.warn('⚠️ Usuário não autenticado');
      return null;
    }

    // Buscar clínica do usuário
    const { data, error } = await supabase
      .from('usuarios_clinicas')
      .select('clinica_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar clínica do usuário:', error.message);
      return null;
    }

    const clinicId = data?.clinica_id ?? null;
    
    if (!clinicId) {
      console.warn('⚠️ Usuário não possui clínica associada');
    }

    return clinicId;
  } catch (error) {
    console.error('❌ Erro na função getCurrentClinicId:', error);
    return null;
  }
});

/** 
 * Retorna o clinica_id do usuário autenticado (primeiro vínculo).
 * Função com cache para evitar múltiplas consultas na mesma requisição.
 */
export async function getCurrentClinicId(): Promise<string | null> {
  return getCachedClinicId();
}

/** 
 * Versão que lança erro se não encontrar clínica.
 * Útil para server actions que precisam garantir que o usuário tem clínica.
 */
export async function requireCurrentClinicId(): Promise<string> {
  const clinicId = await getCurrentClinicId();
  
  if (!clinicId) {
    throw new Error('Usuário não possui clínica associada ou não está autenticado');
  }
  
  return clinicId;
}

/** 
 * Verifica se o usuário tem acesso a uma clínica específica.
 */
export async function hasAccessToClinic(targetClinicId: string): Promise<boolean> {
  try {
    const userClinicId = await getCurrentClinicId();
    return userClinicId === targetClinicId;
  } catch (error) {
    console.error('❌ Erro ao verificar acesso à clínica:', error);
    return false;
  }
}

