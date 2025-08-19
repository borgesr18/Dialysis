import { requestPasswordResetAction } from './actions';

export default function ResetPasswordPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <h1 className="text-xl font-semibold mb-2">Recuperar senha</h1>
        <p className="text-sm text-neutral-500 mb-4">Informe seu e-mail para receber o link de redefinição.</p>

        {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form action={requestPasswordResetAction} className="grid gap-3">
          <input type="email" name="email" required placeholder="seu@email.com" className="border rounded-md px-3 py-2"/>
          <button className="rounded-xl px-4 py-2 bg-black text-white">Enviar link</button>
        </form>
      </div>
    </div>
  );
}
