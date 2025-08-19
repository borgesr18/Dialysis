import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { toggleAtivo, removePaciente } from './_actions';

export const dynamic = 'force-dynamic';

type SearchParams = { q?: string; status?: 'todos' | 'ativos' | 'inativos' };

export default async function PacientesPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  // Sem vínculo -> onboarding (evita 500)
  if (!clinicaId) redirect('/onboarding');

  const q = (searchParams.q ?? '').trim();
  const status = (searchParams.status ?? 'ativos') as SearchParams['status'];

  let query = supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, ativo, alerta_texto')
    .eq('clinica_id', clinicaId)
    .order('nome_completo', { ascending: true });

  if (q) query = query.or(`nome_completo.ilike.%${q}%,registro.ilike.%${q}%`);
  if (status === 'ativos') query = query.eq('ativo', true);
  if (status === 'inativos') query = query.eq('ativo', false);

  const { data: pacientes, error } = await query;
  if (error) {
    return <div className="p-6 text-red-600">Erro ao carregar pacientes: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <Link href="/pacientes/new" className="btn">
          <i className="fa-solid fa-plus mr-2" /> Novo paciente
        </Link>
      </div>

      <form className="card grid md:grid-cols-4 gap-3">
        <input
          className="input md:col-span-2"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou REG"
        />
        <select className="input" name="status" defaultValue={status}>
          <option value="todos">Todos</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
        </select>
        <button className="btn md:col-start-4" type="submit">
          <i className="fa-solid fa-magnifying-glass mr-2" /> Filtrar
        </button>
      </form>

      <div className="grid gap-2">
        {(pacientes ?? []).map((p) => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{p.nome_completo}</div>
              <div className="text-sm text-neutral-600">
                REG {p.registro} • {p.cidade_nome ?? '—'}
              </div>
              {p.alerta_texto && (
                <div className="text-xs mt-1 chip bg-red-50 text-red-700">
                  <i className="fa-solid fa-triangle-exclamation mr-1" />
                  {p.alerta_texto}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm"
                href={`/pacientes/${p.id}`}
              >
                <i className="fa-solid fa-eye mr-1" /> Ver
              </Link>

              <Link
                className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm"
                href={`/pacientes/${p.id}/edit`}
              >
                <i className="fa-solid fa-pen-to-square mr-1" /> Editar
              </Link>

              {/* Toggle ativo/inativo (Server Action inline) */}
              <form
                action={async () => {
                  'use server';
                  await toggleAtivo(p.id, !p.ativo);
                }}
              >
                <button className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm" type="submit">
                  {p.ativo ? (
                    <>
                      <i className="fa-solid fa-user-slash mr-1" /> Inativar
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-user-check mr-1" /> Ativar
                    </>
                  )}
                </button>
              </form>

              {/* Remover (Server Action inline) */}
              <form
                action={async () => {
                  'use server';
                  await removePaciente(p.id);
                }}
              >
                <button
                  className="px-3 py-1.5 rounded-md border hover:bg-red-50 text-sm text-red-600"
                  type="submit"
                >
                  <i className="fa-solid fa-trash mr-1" /> Remover
                </button>
              </form>
            </div>
          </div>
        ))}

        {(!pacientes || pacientes.length === 0) && (
          <div className="text-sm text-neutral-500">Nenhum paciente encontrado.</div>
        )}
      </div>
    </div>
  );
}

