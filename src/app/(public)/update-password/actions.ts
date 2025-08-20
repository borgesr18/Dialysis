'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirm  = String(formData.get('confirm') ?? '');

  if (!password || password.length < 8) {
    redirect('/update-password?error=' + encodeURIComponent('A senha precisa ter ao menos 8 caracteres.'));
  }
  if (password !== confirm) {
    redirect('/update-password?error=' + encodeURIComponent('As senhas não conferem.'));
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?error=' + encodeURIComponent('Sessão inválida. Reabra o link do e-mail.'));
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect('/update-password?error=' + encodeURIComponent(error.message));
  }

  redirect('/login?msg=' + encodeURIComponent('Senha atualizada com sucesso. Entre novamente.'));
}
