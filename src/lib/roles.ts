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

export async function assertRole(...roles: PapelUsuario[]) {
  const role = await getMyRole();
  if (!role || !roles.includes(role)) redirect('/forbidden');
}

type Permission =
  | 'manage_members';

const rolePermissions: Record<PapelUsuario, Permission[]> = {
  ADMIN: ['manage_members'],
  GESTOR: [],
  ENFERMAGEM: [],
  TECNICO: [],
  FARMACIA: [],
  MEDICO: [],
  VISUALIZADOR: [],
};

export async function can(permission: Permission) {
  const role = await getMyRole();
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export async function getUserClinicId(): Promise<string | null> {
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

export async function requireClinicAccess(clinicaId: string) {
  const userClinicId = await getUserClinicId();
  if (!userClinicId || userClinicId !== clinicaId) {
    redirect('/forbidden');
  }
}

export async function hasClinicAccess(clinicaId: string): Promise<boolean> {
  const userClinicId = await getUserClinicId();
  return userClinicId === clinicaId;
}
