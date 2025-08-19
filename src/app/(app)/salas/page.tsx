import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';


export default async function SalasPage() {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: salas } = await supabase
    .from('salas')
    .select('*')
    .eq('clinica_id', clinicaId)
    .order('nome');

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Salas</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
            Filtrar
          </button>
          <a
            href="/salas/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Nova
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(salas ?? []).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3">{s.nome}</td>
                <td className="px-4 py-3">{s.descricao ?? '—'}</td>
                <td className="px-4 py-3">
                  <a href={`/salas/${s.id}/edit`} className="text-primary-700 hover:underline">
                    Editar
                  </a>
                </td>
              </tr>
            ))}
            {(!salas || salas.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-neutral-600" colSpan={3}>
                  Nenhuma sala cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


