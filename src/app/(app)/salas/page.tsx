// src/app/(app)/salas/page.tsx
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

export default async function SalasPage() {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: salas, error } = await supabase
    .from('salas')
    .select('*')
    .eq('clinica_id', clinicaId)
    .order('nome');

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Salas</h1>
        <p className="text-red-600 mt-2">Erro ao carregar salas: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Salas</h1>
      <div className="grid gap-2">
        {(salas ?? []).map((s) => (
          <div key={s.id} className="border rounded-xl p-3">
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

