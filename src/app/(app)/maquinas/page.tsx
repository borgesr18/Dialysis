import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
async function deleteMaquina(id: string) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { error } = await supabase
    .from('maquinas')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);
  const ok = !error ? 'Máquina excluída com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}







type SearchParams = { ok?: string; error?: string };

export default async function MaquinasPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const [{ data: maquinas }, { data: salas }] = await Promise.all([
    supabase
      .from('maquinas')
      .select('id, sala_id, identificador, marca, modelo, serie, ativa')
      .eq('clinica_id', clinica_id)
      .order('identificador', { ascending: true }),
    supabase
      .from('salas')
      .select('id, nome')
      .eq('clinica_id', clinica_id)
      .order('nome', { ascending: true }),
  ]);

  const salaNome = new Map((salas ?? []).map((s) => [s.id, s.nome as string]));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Máquinas</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
            Filtrar
          </button>
          <Link
            href="/maquinas/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Nova
          </Link>
        </div>
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

      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="px-4 py-3">Sala</th>
              <th className="px-4 py-3">Identificador</th>
              <th className="px-4 py-3">Marca</th>
              <th className="px-4 py-3">Modelo</th>
              <th className="px-4 py-3">Série</th>
              <th className="px-4 py-3">Ativa</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(maquinas ?? []).map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3">{salaNome.get(m.sala_id) ?? '-'}</td>
                <td className="px-4 py-3">{m.identificador}</td>
                <td className="px-4 py-3">{m.marca ?? '-'}</td>
                <td className="px-4 py-3">{m.modelo ?? '-'}</td>
                <td className="px-4 py-3">{m.serie ?? '-'}</td>
                <td className="px-4 py-3">
                  {m.ativa ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
                      Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-700">
                      Inativa
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/maquinas/${m.id}/edit`}
                      className="text-primary-700 hover:underline"
                    >
                      Editar
                    </Link>
                    <form action={deleteMaquina.bind(null, m.id)}>
                      <button className="text-red-600 hover:underline" type="submit">
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!maquinas || maquinas.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-neutral-600" colSpan={7}>
                  Nenhuma máquina cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
