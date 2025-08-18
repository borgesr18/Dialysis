import { createClient } from './supabase-server';

export async function getCurrentClinicId(): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('usuarios_clinicas')
    .select('clinica_id')
    .limit(1)
    .single();
  if (error) return null;
  return data?.clinica_id ?? null;
}
