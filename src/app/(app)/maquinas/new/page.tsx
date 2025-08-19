import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

async function createMaquina(fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const sala_id = String(fd.get('sala_id') || '');
  const identificador = String(fd.get('identificador') || '');
  const marca = String(fd.get('marca') || '');
  const modelo = String(fd.get('modelo') || '');
  const serie = String(fd.get('serie') || '');
  const ativa = String(fd.get('ativa') || 'true') === 'true';

  interface MaquinaPayload {
    nome: string;
    modelo?: string;
    numero_serie?: string;
    sala_id?: string;
    clinica_id: string;
  }

  const insertPayload: MaquinaPayload = {
    clinica_id,
    sala_id,
    identificador,
    ativa,
  };
  if (marca) insertPayload.marca = marca;
  if (modelo) insertPayload.modelo = modelo;
  if (serie) insertPayload.serie = serie;

  const { error } = await supabase.from('maquinas').insert(insertPayload);

  const ok = !error ? 'Máquina criada com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}

export default async function NovaMaquinaPage() {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { data: salas } = await supabase
    .from('salas')
    .select('id, nome')
    .eq('clinica_id', clinica_id)
    .order('nome', { ascending: true });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nova Máquina</h1>
        <Link
          href="/maquinas"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50"
        >
          Voltar
        </Link>
      </div>

      <form
        action={createMaquina}
        className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 max-w-2xl md:grid-cols-2"
      >
        <div className="grid gap-1.5 md:col-span-2">
          <label className="text-sm text-neutral-700">Sala</label>
          <select name="sala_id" className="border rounded-md px-3 py-2" required>
            <option value="">Selecione a sala</option>
            {(salas ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Identificador</label>
          <input
            className="border rounded-md px-3 py-2"
            name="identificador"
            placeholder="Ex.: M-01"
            required
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Marca</label>
          <input className="border rounded-md px-3 py-2" name="marca" placeholder="Ex.: Fresenius" />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Modelo</label>
          <input className="border rounded-md px-3 py-2" name="modelo" placeholder="Ex.: 4008S" />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Série</label>
          <input className="border rounded-md px-3 py-2" name="serie" placeholder="Nº de série" />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Status</label>
          <select name="ativa" className="border rounded-md px-3 py-2" defaultValue="true">
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        </div>

        <div className="pt-2 md:col-span-2">
          <button
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            type="submit"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
