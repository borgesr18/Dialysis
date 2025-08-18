// src/app/(app)/turnos/page.tsx
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

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Turnos</h1>
        <p className="text-red-600 mt-2">Erro ao carregar turnos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Turnos</h1>
      <div className="grid gap-2">
        {(turnos ?? []).map((t) => (
          <div key={t.id} className="border rounded-xl p-3">
            <div className="font-medium">{t.nome}</div>
            <div className="text-sm text-neutral-600">
              {t.hora_inicio}–{t.hora_fim} • {Array.isArray(t.dias_semana) ? t.dias_semana.join(', ') : '—'}
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

