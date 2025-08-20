import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

async function updateMaquina(id: string, fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const sala_id = String(fd.get('sala_id') || '');
  const identificador = String(fd.get('identificador') || '').trim();
  const marca = String(fd.get('marca') || '').trim();
  const modelo = String(fd.get('modelo') || '').trim();
  const serie = String(fd.get('serie') || '').trim();
  const ativa = String(fd.get('ativa') || 'true') === 'true';

  if (!identificador) {
    redirect('/maquinas?error=' + encodeURIComponent('Identificador é obrigatório.'));
  }

  const payload: any = {
    sala_id,
    identificador,
    ativa,
  };
  if (marca) payload.marca = marca;
  if (modelo) payload.modelo = modelo;
  if (serie) payload.serie = serie;

  const { error } = await supabase
    .from('maquinas')
    .update(payload)
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  const ok = !error ? 'Máquina atualizada com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}

export default async function EditarMaquinaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    redirect('/maquinas?error=' + encodeURIComponent('ID inválido'));
  }

  const [{ data: maquina }, { data: salas }] = await Promise.all([
    supabase
      .from('maquinas')
      .select('id, sala_id, identificador, marca, modelo, serie, ativa')
      .eq('id', params.id)
      .eq('clinica_id', clinica_id)
      .maybeSingle(),
    supabase
      .from('salas')
      .select('id, nome')
      .eq('clinica_id', clinica_id)
      .order('nome', { ascending: true }),
  ]);

  if (!maquina) {
    redirect('/maquinas?error=' + encodeURIComponent('Máquina não encontrada'));
  }

  async function action(fd: FormData) {
    'use server';
    return updateMaquina(params.id, fd);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar Máquina</h1>
        <Link
          href="/maquinas"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50"
        >
          Voltar
        </Link>
      </div>

      <form
        action={action}
        className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 max-w-2xl md:grid-cols-2"
      >
        <div className="grid gap-1.5 md:col-span-2">
          <label className="text-sm text-neutral-700">Sala</label>
          <select name="sala_id" className="border rounded-md px-3 py-2" defaultValue={maquina.sala_id} required>
            <option value="">Selecione a sala</option>
            {(salas ?? []).map((s: any) => (
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
            defaultValue={maquina.identificador ?? ''}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Marca</label>
          <input className="border rounded-md px-3 py-2" name="marca" defaultValue={maquina.marca ?? ''} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Modelo</label>
          <input className="border rounded-md px-3 py-2" name="modelo" defaultValue={maquina.modelo ?? ''} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Série</label>
          <input className="border rounded-md px-3 py-2" name="serie" defaultValue={maquina.serie ?? ''} />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Status</label>
          <select name="ativa" className="border rounded-md px-3 py-2" defaultValue={maquina.ativa ? 'true' : 'false'}>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        </div>

        <div className="pt-2 md:col-span-2">
          <button
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            type="submit"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
