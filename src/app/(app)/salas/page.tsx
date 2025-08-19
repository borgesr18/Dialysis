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

      <div className="grid gap-2">
        {(salas ?? []).map((s) => (
          <div key={s.id} className="card">
            <div className="font-medium">{s.nome}</div>
            <div className="text-sm text-neutral-600">{s.descricao ?? '—'}</div>
          </div>
        ))}
        {(!salas || salas.length === 0) && (
          <div className="text-sm text-neutral-500">Nenhuma sala cadastrada.</div>
        )}
      </div>
    </div>
  );
}


