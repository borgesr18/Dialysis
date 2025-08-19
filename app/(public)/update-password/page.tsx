import { updatePasswordAction } from './actions';

export const dynamic = 'force-dynamic';

export default function UpdatePasswordPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <h1 className="text-xl font-semibold mb-2">Definir nova senha</h1>
        <p className="text-sm text-neutral-500 mb-4">Informe a nova senha para sua conta.</p>

        {error && (
          <div role="alert" aria-live="polite"
               className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form action={updatePasswordAction} method="post" className="grid gap-3">
          <div className="grid gap-1.5">
            <label htmlFor="new-password" className="text-sm text-neutral-700">Nova senha</label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="border rounded-md px-3 py-2 w-full"
              placeholder="********"
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="confirm-password" className="text-sm text-neutral-700">Confirme a nova senha</label>
            <input
              id="confirm-password"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="border rounded-md px-3 py-2 w-full"
              placeholder="********"
            />
          </div>

          <button type="submit" className="rounded-xl px-4 py-2 bg-black text-white mt-2">
            Atualizar senha
          </button>
        </form>
      </div>
    </div>
  );
}
