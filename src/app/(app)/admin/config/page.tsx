import { requireAdmin } from '@/lib/roles';

export default async function AdminConfigPage() {
  await requireAdmin();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Configurações da Clínica</h1>
      <p className="text-sm text-neutral-600">Em breve: edição de dados da clínica e papéis de usuários.</p>
    </div>
  );
}
