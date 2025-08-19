import Link from 'next/link';
import { signInWithPasswordAction } from './actions';

export const dynamic = 'force-dynamic';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; msg?: string };
}) {
  const error = searchParams?.error;
  const msg = searchParams?.msg;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <p className="text-sm text-neutral-500">
            Use seu e-mail e senha para acessar.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        {msg && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
          >
            {msg}
          </div>
        )}

        <form action={signInWithPasswordAction} method="post" className="grid gap-3">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm text-neutral-700">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="border rounded-md px-3 py-2 w-full"
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm text-neutral-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="border rounded-md px-3 py-2 w-full"
              placeholder="********"
            />
          </div>

          <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white mt-2">
            Entrar
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <Link href="/reset-password" prefetch={false} className="text-primary-700 hover:underline">
            Esqueci minha senha
          </Link>
          {/* <Link href="/signup" className="text-neutral-600 hover:underline">Criar conta</Link> */}
        </div>
      </div>
    </main>
  );
}

