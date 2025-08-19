import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function createTurno(fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const nome = String(fd.get('nome') || '');
  const hora_inicio = String(fd.get('hora_inicio') || '06:00');
  const hora_fim = String(fd.get('hora_fim') || '10:00');
  const dias = String(fd.get('dias') || '');
  const dias_semana = dias
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  const { error } = await supabase.from('turnos').insert({
    clinica_id,
    nome,
    hora_inicio,
    hora_fim,
    dias_semana,
  });

  const ok = !error ? 'Turno criado com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/turnos${params}`);
}

export default function NovoTurnoPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novo Turno</h1>
        <Link href="/turnos" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
          Voltar
        </Link>
      </div>

      <form action={createTurno} className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 max-w-xl md:grid-cols-2">
        <div className="grid gap-1.5 md:col-span-2">
          <label className="text-sm text-neutral-700">Nome</label>
          <input className="input border rounded-md px-3 py-2" name="nome" placeholder="Nome do turno" required />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Hora início</label>
          <input className="input border rounded-md px-3 py-2" name="hora_inicio" type="time" defaultValue="06:00" />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Hora fim</label>
          <input className="input border rounded-md px-3 py-2" name="hora_fim" type="time" defaultValue="10:00" />
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <label className="text-sm text-neutral-700">Dias da semana</label>
          <input className="input border rounded-md px-3 py-2" name="dias" placeholder="Ex.: SEG,QUA,SEX" />
        </div>
        <div className="pt-2 md:col-span-2">
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
