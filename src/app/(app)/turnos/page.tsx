import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';


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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Turnos</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
            Filtrar
          </button>
          <a
            href="/turnos/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Novo
          </a>
        </div>
      </div>

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

