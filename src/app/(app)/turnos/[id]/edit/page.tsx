import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

async function updateTurno(id: string, fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const nome = String(fd.get('nome') || '').trim();
  const hora_inicio = String(fd.get('hora_inicio') || '').trim();
  const hora_fim = String(fd.get('hora_fim') || '').trim();
  const dias = String(fd.get('dias_semana') || '').trim();

  if (!nome || !hora_inicio || !hora_fim) {
    redirect('/turnos?error=' + encodeURIComponent('Preencha nome e horários.'));
  }

  const dias_semana = dias
    ? dias.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
    : null;

  const payload: any = { nome, hora_inicio, hora_fim };
  if (dias_semana) payload.dias_semana = dias_semana;

  const { error } = await supabase
    .from('turnos')
    .update(payload)
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  const ok = !error ? 'Turno atualizado com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/turnos${params}`);
}

export default async function EditarTurnoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const { data: turno } = await supabase
    .from('turnos')
    .select('id, nome, hora_inicio, hora_fim, dias_semana')
    .eq('id', params.id)
    .eq('clinica_id', clinica_id)
    .maybeSingle();

  if (!turno) {
    redirect('/turnos?error=' + encodeURIComponent('Turno não encontrado'));
  }

  async function action(fd: FormData) {
    'use server';
    return updateTurno(params.id, fd);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar Turno</h1>
        <Link
          href="/turnos"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50"
        >
          Voltar
        </Link>
      </div>

      <form
        action={action}
        className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 max-w-xl md:grid-cols-2"
      >
        <div className="grid gap-1.5 md:col-span-2">
          <label className="text-sm text-neutral-700">Nome</label>
          <input className="border rounded-md px-3 py-2" name="nome" defaultValue={turno.nome} required />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Hora início</label>
          <input className="border rounded-md px-3 py-2" name="hora_inicio" type="time" defaultValue={String(turno.hora_inicio)} required />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Hora fim</label>
          <input className="border rounded-md px-3 py-2" name="hora_fim" type="time" defaultValue={String(turno.hora_fim)} required />
        </div>

        <div className="grid gap-1.5 md:col-span-2">
          <label className="text-sm text-neutral-700">Dias da semana (separados por vírgula)</label>
          <input
            className="border rounded-md px-3 py-2"
            name="dias_semana"
            placeholder="SEG, QUA, SEX"
            defaultValue={Array.isArray(turno.dias_semana) ? (turno.dias_semana as string[]).join(', ') : ''}
          />
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
