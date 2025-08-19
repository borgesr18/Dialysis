import { requireAdmin } from '@/lib/roles';

export default async function AdminMembrosPage() {
  await requireAdmin();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Gerenciar Membros</h1>
      <p className="text-sm text-neutral-600">Em breve: listagem e gerenciamento de vínculos de usuários à clínica.</p>
    </div>
  );
}
