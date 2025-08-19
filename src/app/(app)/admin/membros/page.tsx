import { requireAdmin } from '@/lib/roles';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { createAdminClient } from '@/lib/supabase-admin';
import { linkExistingUserByEmail, inviteUser, updateRole, removeMember } from './_actions';
export const runtime = 'nodejs';


type SearchParams = { ok?: string; error?: string };

type Member = {
  id: string;
  email: string;
  papel: string;
};

async function fetchMembers(hasAdminKey: boolean): Promise<Member[]> {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  if (!clinica_id) return [];
  const { data: vincs } = await supabase
    .from('usuarios_clinicas')
    .select('user_id')
    .eq('clinica_id', clinica_id)
    .order('created_at', { ascending: true });

  const ids = (vincs ?? []).map((v) => v.user_id as string);
  if (ids.length === 0) return [];

  const { data: perfis } = await supabase
    .from('perfis_usuarios')
    .select('id, papel')
    .in('id', ids);

  const papelMap = new Map((perfis ?? []).map((p) => [p.id as string, p.papel as string]));
  const users: Member[] = [];

  if (!hasAdminKey) {
    for (const id of ids) {
      users.push({
        id,
        email: '(configure SUPABASE_SERVICE_ROLE_KEY para exibir e-mails)',
        papel: papelMap.get(id) ?? 'VISUALIZADOR',
      });
    }
    return users;
  }

  try {
    const admin = createAdminClient();
    for (const id of ids) {
      try {
        const { data } = await admin.auth.admin.getUserById(id);
        users.push({
          id,
          email: data.user?.email ?? '(sem e-mail)',
          papel: papelMap.get(id) ?? 'VISUALIZADOR',
        });
      } catch {
        users.push({
          id,
          email: '(erro ao carregar e-mail)',
          papel: papelMap.get(id) ?? 'VISUALIZADOR',
        });
      }
    }
    return users;
  } catch {
    for (const id of ids) {
      users.push({
        id,
        email: '(erro no Admin API)',
        papel: papelMap.get(id) ?? 'VISUALIZADOR',
      });
    }
    return users;
  }
}

export default async function AdminMembrosPage({ searchParams }: { searchParams?: SearchParams }) {
  await requireAdmin();
  const hasAdminKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const members = await fetchMembers(hasAdminKey);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gerenciar Membros</h1>
      </div>

      {searchParams?.ok && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          {decodeURIComponent(searchParams.ok)}
        </div>
      )}
      {searchParams?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      {!hasAdminKey && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          Para listar e-mails e enviar convites, configure a variável SUPABASE_SERVICE_ROLE_KEY no ambiente (Vercel).
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="font-medium">Vincular usuário existente</h2>
        <form action={linkExistingUserByEmail} className="flex flex-wrap items-end gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="email@exemplo.com"
            className="rounded-lg border px-3 py-2"
          />
          <select name="papel" className="rounded-lg border px-3 py-2" defaultValue="VISUALIZADOR">
            <option value="VISUALIZADOR">VISUALIZADOR</option>
            <option value="ENFERMAGEM">ENFERMAGEM</option>
            <option value="TECNICO">TECNICO</option>
            <option value="FARMACIA">FARMACIA</option>
            <option value="MEDICO">MEDICO</option>
            <option value="GESTOR">GESTOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700" type="submit">
            Vincular
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="font-medium">Convidar novo usuário</h2>
        <form action={inviteUser} className="flex flex-wrap items-end gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="email@exemplo.com"
            className="rounded-lg border px-3 py-2"
          />
          <button className="rounded-lg bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-900" type="submit">
            Enviar convite
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3">{m.email}</td>
                <td className="px-4 py-3">{m.papel}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <form action={updateRole} className="flex items-center gap-2">
                      <input type="hidden" name="user_id" value={m.id} />
                      <select name="papel" defaultValue={m.papel} className="rounded-lg border px-2 py-1">
                        <option value="VISUALIZADOR">VISUALIZADOR</option>
                        <option value="ENFERMAGEM">ENFERMAGEM</option>
                        <option value="TECNICO">TECNICO</option>
                        <option value="FARMACIA">FARMACIA</option>
                        <option value="MEDICO">MEDICO</option>
                        <option value="GESTOR">GESTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button className="text-primary-700 hover:underline" type="submit">Atualizar</button>
                    </form>
                    <form action={removeMember}>
                      <input type="hidden" name="user_id" value={m.id} />
                      <button className="text-red-600 hover:underline" type="submit">Remover</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-neutral-600" colSpan={3}>
                  Nenhum membro vinculado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
