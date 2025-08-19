'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) redirect('/reset-password?error=' + encodeURIComponent('Informe um e-mail.'));

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? ''}/update-password`,
  });
  if (error) redirect('/reset-password?error=' + encodeURIComponent(error.message));

  redirect('/login?msg=' + encodeURIComponent('Enviamos um e-mail com instruções para redefinir sua senha.'));
}
