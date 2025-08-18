import { createClient } from '@/src/lib/supabase-server';
import { getClinicId } from '@/src/lib/get-clinic';

export default async function SalasPage() {
  const supabase = createClient();
  const { data: salas } = await supabase.from('salas').select('*, maquinas(*)').order('nome');

  async function createSala(formData: FormData) {
    'use server';
    const supabase = createClient();
    const clinica_id = await getClinicId();
    await supabase.from('salas').insert({
      clinica_id,
      nome: String(formData.get('nome') || ''),
      descricao: String(formData.get('descricao') || '') || null,
    });
  }

  async function createMaquina(formData: FormData) {
    'use server';
    const supabase = createClient();
    const clinica_id = await getClinicId();
    await supabase.from('maquinas').insert({
      clinica_id,
      sala_id: String(formData.get('sala_id') || ''),
      identificador: String(formData.get('identificador') || ''),
      marca: String(formData.get('marca') || '') || null,
      modelo: String(formData.get('modelo') || '') || null,
      numero_serie: String(formData.get('numero_serie') || '') || null,
      ativa: true,
    });
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Salas & Máquinas</h1>

      <form action={createSala} className="card grid md:grid-cols-4 gap-3">
        <div className="md:col-span-1">
          <label className="label">Nome da sala</label>
          <input name="nome" className="input" required />
        </div>
        <div className="md:col-span-2">
          <label className="label">Descrição</label>
          <input name="descricao" className="input" />
        </div>
        <div className="md:col-span-1 flex items-end">
          <button className="btn w-full" type="submit">Adicionar sala</button>
        </div>
      </form>

      <div className="grid gap-4">
        {(salas||[]).map((s)=> (
          <div key={s.id} className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">{s.nome}</h2>
              <span className="text-xs text-neutral-500">{s.maquinas?.length ?? 0} máquina(s)</span>
            </div>
            <form action={createMaquina} className="grid md:grid-cols-6 gap-2">
              <input type="hidden" name="sala_id" value={s.id} />
              <input name="identificador" placeholder="Identificador (ex: M01)" className="input" required />
              <input name="marca" placeholder="Marca" className="input" />
              <input name="modelo" placeholder="Modelo" className="input" />
              <input name="numero_serie" placeholder="Nº de série" className="input" />
              <button className="btn md:col-span-1" type="submit">Adicionar</button>
            </form>
            <div className="mt-3 grid md:grid-cols-4 gap-2">
              {(s.maquinas||[]).map((m:any)=> (
                <div key={m.id} className="border rounded-xl p-3 text-sm">
                  <div className="font-medium">{m.identificador}</div>
                  <div className="text-neutral-500">{m.marca ?? '—'} {m.modelo ?? ''}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
