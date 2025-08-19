import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

export const dynamic = 'force-dynamic';

type SearchParams = {
  ok?: string;
  error?: string;
};

type Paciente = {
  id: string;
  registro: string;
  nome_completo: string;
  cidade_nome: string | null;
  ativo: boolean;
  created_at: string;
};

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, ativo, created_at')
    .eq('clinica_id', clinica_id)
    .order('nome_completo', { ascending: true });

  if (error) {
    throw new Error('Falha ao carregar pacientes: ' + error.message);
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
            Filtrar
          </button>
          <Link
            href="/pacientes/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
          >
            Novo
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {searchParams?.ok && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          {decodeURIComponent(searchParams.ok)}
        </div>
      )}
      {searchParams?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}


      {/* Lista */}
      <div className="rounded-xl border border-neutral-200 bg-white">
        <div className="border-b px-4 py-3 text-sm text-neutral-600">
          {pacientes?.length ?? 0} paciente(s)
        </div>
        <ul className="divide-y">
          {(pacientes as Paciente[] | null)?.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{p.nome_completo}</div>
                <div className="text-sm text-neutral-500">
                  REG {p.registro} • {p.cidade_nome ?? '—'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    p.ativo
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <Link
                  href={`/pacientes/${p.id}`}
                  className="text-primary-600 hover:underline"
                >
                  Abrir
                </Link>
              </div>
            </li>
          ))}
          {(!pacientes || pacientes.length === 0) && (
            <li className="px-4 py-8 text-center text-neutral-500">
              Nenhum paciente encontrado.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}


