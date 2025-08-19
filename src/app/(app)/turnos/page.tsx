import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

async function deleteTurno(id: string) {

  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { error } = await supabase
    .from('turnos')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);
  const ok = !error ? 'Turno excluído com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/turnos${params}`);
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

      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Hora</th>
              <th className="px-4 py-3">Dias</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(turnos ?? []).map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3">{t.nome}</td>
                <td className="px-4 py-3">
                  {String(t.hora_inicio)}–{String(t.hora_fim)}
                </td>
                <td className="px-4 py-3">{Array.isArray(t.dias_semana) ? t.dias_semana.join(', ') : '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <a href={`/turnos/${t.id}/edit`} className="text-primary-700 hover:underline">
                      Editar
                    </a>
                    <form action={deleteTurno.bind(null, t.id)}>
                      <button className="text-red-600 hover:underline" type="submit">
                        Excluir
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(!turnos || turnos.length === 0) && (
              <tr>
                <td className="px-4 py-6 text-neutral-600" colSpan={4}>
                  Nenhum turno cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

