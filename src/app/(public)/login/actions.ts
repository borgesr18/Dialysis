'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Informe e-mail e senha.'));
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password }); // e-mail + senha
  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message));
  }

  // ok: redireciona para o app
  redirect('/dashboard');
}
