import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

async function createSala(fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  await supabase.from('salas').insert({
    clinica_id,
    nome: String(fd.get('nome') || ''),
    descricao: String(fd.get('descricao') || ''),
  });
}

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
      <h1 className="text-2xl font-semibold">Salas</h1>

      <form action={createSala} className="card grid gap-2 md:grid-cols-3">
        <input className="input" name="nome" placeholder="Nome da sala" required />
        <input className="input md:col-span-2" name="descricao" placeholder="Descrição" />
        <button className="btn md:col-start-3">Salvar</button>
      </form>

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


