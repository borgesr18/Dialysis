import { createClient } from './supabase-server';
import { cache } from 'react';

// Cache da função para evitar múltiplas consultas na mesma requisição
const getCachedClinicId = cache(async (): Promise<string | null> => {
  try {
    const supabase = createClient();
    
    // Verificar usuário autenticado com timeout
    const userPromise = supabase.auth.getUser();
    const { data: { user }, error: userError } = await Promise.race([
      userPromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao verificar usuário')), 5000)
      )
    ]);
    
    if (userError) {
      console.warn('⚠️ Erro ao verificar usuário:', userError.message);
      return null;
    }

    if (!user) {
      console.warn('⚠️ Usuário não autenticado');
      return null;
    }

    // Buscar clínica do usuário com timeout
    const clinicPromise = supabase
      .from('usuarios_clinicas')
      .select('clinica_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await Promise.race([
      clinicPromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao buscar clínica')), 5000)
      )
    ]);

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

