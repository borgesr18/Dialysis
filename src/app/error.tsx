'use client';
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  console.error(error);
  return (
    <html>
      <body className="mx-auto max-w-5xl p-6">
        <div className="card">
          <h1 className="text-lg font-semibold">Ops! Algo deu errado.</h1>
          <p className="text-sm text-neutral-600">Tente novamente. Se persistir, contate o suporte.</p>
        </div>
      </body>
    </html>
  );
}
