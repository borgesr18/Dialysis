import { createClient } from './supabase-server';

/** Retorna o clinica_id do usuário autenticado (primeiro vínculo). */
export async function getCurrentClinicId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Usuário não autenticado:', userError?.message || 'No user found');
      return null;
    }

    const { data, error } = await supabase
      .from('usuarios_clinicas')
      .select('clinica_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar clínica do usuário:', error.message);
      return null;
    }

    return data?.clinica_id ?? null;
  } catch (error) {
    console.error('Erro na função getCurrentClinicId:', error);
    return null;
  }
}
