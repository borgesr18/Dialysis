import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

async function createTurno(fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  await supabase.from('turnos').insert({
    clinica_id,
    nome: String(fd.get('nome') || ''),
    hora_inicio: String(fd.get('hora_inicio') || '06:00'),
    hora_fim: String(fd.get('hora_fim') || '10:00'),
    dias_semana: (String(fd.get('dias') || '') || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean), // espera enum/text conforme seu schema
  });
}

export default async function TurnosPage() {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: turnos, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('clinica_id', clinicaId)
    .order('nome');

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Turnos</h1>

      <form action={createTurno} className="card grid gap-2 md:grid-cols-4">
        <input className="input md:col-span-2" name="nome" placeholder="Nome do turno" required />
        <input className="input" name="hora_inicio" type="time" defaultValue="06:00" />
        <input className="input" name="hora_fim" type="time" defaultValue="10:00" />
        <input className="input md:col-span-4" name="dias" placeholder="Dias (ex.: SEG,QUA,SEX)" />
        <button className="btn md:col-start-4">Salvar</button>
      </form>

      {error && <p className="text-red-600">Erro ao carregar turnos: {error.message}</p>}

      <div className="grid gap-2">
        {(turnos ?? []).map((t) => (
          <div key={t.id} className="card">
            <div className="font-medium">{t.nome}</div>
            <div className="text-sm text-neutral-600">
              {String(t.hora_inicio)}–{String(t.hora_fim)} • {Array.isArray(t.dias_semana) ? t.dias_semana.join(', ') : '—'}
            </div>
          </div>
        ))}
        {(!turnos || turnos.length === 0) && (
          <div className="text-sm text-neutral-500">Nenhum turno cadastrado.</div>
        )}
      </div>
    </div>
  );
}

