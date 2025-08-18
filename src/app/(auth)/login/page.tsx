import '../../styles/globals.css';
import { createClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  async function signInWithOtp(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '');
    const supabase = createClient();
    await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    return redirect('/login?sent=1');
  }

  return (
    <html lang="pt-BR">
      <body className="min-h-screen grid place-items-center bg-neutral-50">
        <form action={signInWithOtp} className="card w-full max-w-md space-y-4">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <label className="label">E-mail</label>
          <input name="email" type="email" required placeholder="voce@exemplo.com" className="input" />
          <button className="btn" type="submit">Receber link mágico</button>
          <p className="text-xs text-neutral-500">Você receberá um e-mail para entrar.</p>
        </form>
      </body>
    </html>
  );
}
