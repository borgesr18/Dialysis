'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { requireAdmin } from '@/lib/roles';

export async function linkExistingUserByEmail(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const admin = createAdminClient();
  const clinica_id = await getCurrentClinicId();
  if (!clinica_id) redirect('/onboarding');

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const papel = String(formData.get('papel') || 'VISUALIZADOR');

  let userId: string | null = null;
  let page = 1;
  while (page <= 3 && !userId) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) break;
    for (const u of data.users) {
      if (u.email?.toLowerCase() === email) {
        userId = u.id;
        break;
      }
    }
    page++;
  }

  if (!userId) {
    const err = encodeURIComponent('Usuário não encontrado; envie um convite.');
    redirect(`/admin/membros?error=${err}`);
  }

  const { error: upsertErr } = await supabase.from('perfis_usuarios').upsert({ id: userId, papel });
  if (upsertErr) {
    const err = encodeURIComponent(upsertErr.message);
    redirect(`/admin/membros?error=${err}`);
  }

  const { error: linkErr } = await supabase
    .from('usuarios_clinicas')
    .insert({ user_id: userId, clinica_id });
  if (linkErr) {
    const err = encodeURIComponent(linkErr.message);
    redirect(`/admin/membros?error=${err}`);
  }

  const ok = encodeURIComponent('Usuário vinculado com sucesso');
  redirect(`/admin/membros?ok=${ok}`);
}

export async function updateRole(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const userId = String(formData.get('user_id') || '');
  const papel = String(formData.get('papel') || 'VISUALIZADOR');
  const { error } = await supabase.from('perfis_usuarios').upsert({ id: userId, papel });
  if (error) {
    const err = encodeURIComponent(error.message);
    redirect(`/admin/membros?error=${err}`);
  }
  const ok = encodeURIComponent('Papel atualizado');
  redirect(`/admin/membros?ok=${ok}`);
}

export async function removeMember(formData: FormData) {
  await requireAdmin();
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const userId = String(formData.get('user_id') || '');
  const { error } = await supabase
    .from('usuarios_clinicas')
    .delete()
    .eq('clinica_id', clinica_id)
    .eq('user_id', userId);
  if (error) {
    const err = encodeURIComponent(error.message);
    redirect(`/admin/membros?error=${err}`);
  }
  const ok = encodeURIComponent('Membro removido da clínica');
  redirect(`/admin/membros?ok=${ok}`);
}

export async function inviteUser(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: process.env.APP_URL ? `${process.env.APP_URL}/auth/callback` : undefined,
  });
  if (error) {
    const err = encodeURIComponent(error.message);
    redirect(`/admin/membros?error=${err}`);
  }
  const ok = encodeURIComponent('Convite enviado por e-mail');
  redirect(`/admin/membros?ok=${ok}`);
}
