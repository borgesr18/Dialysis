import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export type PapelUsuario = 'ADMIN' | 'GESTOR' | 'ENFERMAGEM' | 'TECNICO' | 'FARMACIA' | 'MEDICO' | 'VISUALIZADOR';

export async function getMyRole(): Promise<PapelUsuario | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('perfis_usuarios')
    .select('papel')
    .eq('id', user.id)
    .maybeSingle();

  return (data?.papel as PapelUsuario) ?? null;
}

export async function requireSignedIn() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin() {
  const role = await getMyRole();
  if (role !== 'ADMIN') redirect('/forbidden');
}
