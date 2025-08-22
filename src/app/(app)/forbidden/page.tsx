export const dynamic = 'force-dynamic';

export default function ForbiddenPage() {
  return (
    <div className="p-6">
      <div className="max-w-lg mx-auto card">
        <h1 className="text-lg font-semibold">Acesso negado</h1>
        <p className="text-neutral-600 mt-1">
          Você não possui permissão para acessar este recurso.
        </p>
      </div>
    </div>
  );
}
