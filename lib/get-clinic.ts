import { createClient } from './supabase-server';

/** Retorna o clinica_id do usuário autenticado (primeiro vínculo). */
export async function getCurrentClinicId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('usuarios_clinicas')
    .select('clinica_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.clinica_id ?? null;
}
