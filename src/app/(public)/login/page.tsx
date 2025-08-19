import Link from 'next/link';
import { signInWithPasswordAction } from './actions';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <p className="text-sm text-neutral-500">
            Use seu e-mail e senha para acessar.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={signInWithPasswordAction} className="grid gap-3">
          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">E-mail</label>
            <input
              type="email"
              name="email"
              required
              className="border rounded-md px-3 py-2 w-full"
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">Senha</label>
            <input
              type="password"
              name="password"
              required
              className="border rounded-md px-3 py-2 w-full"
              placeholder="********"
            />
          </div>

          <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white mt-2">
            Entrar
          </button>
        </form>

        <div className="mt-4 text-right">
          <Link href="/reset-password" className="text-sm text-primary-700 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}
