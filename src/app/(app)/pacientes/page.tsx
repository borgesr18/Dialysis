import Link from 'next/link';
import PacienteForm from './_form';
import { createPacienteAction } from './_actions';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

type Paciente = {
  id: string;
  registro: string;
  nome_completo: string;
  cidade_nome: string | null;
  alerta_texto: string | null;
  ativo: boolean | null;
};

export const dynamic = 'force-dynamic';

export default async function PacientesPage({
  searchParams,
}: {
  searchParams?: { error?: string; msg?: string };
}) {
  const error = searchParams?.error;
  const msg = searchParams?.msg;

  const supabase = createClient();

  // Tenta obter a clínica atual (evita 500 caso o usuário ainda não tenha vínculo)
  let clinicaId: string | null = null;
  try {
    clinicaId = await getCurrentClinicId();
  } catch {
    clinicaId = null;
  }

  if (!clinicaId) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Pacientes</h1>

        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          Você ainda não está vinculado a uma clínica.
          <Link href="/onboarding" className="ml-2 underline text-amber-900">
            Vincular agora
          </Link>
        </div>

        <p className="text-neutral-600">
          Após concluir o onboarding, você poderá cadastrar e visualizar pacientes.
        </p>
      </div>
    );
  }

  // Busca pacientes da clínica
  const { data: pacientes, error: fetchErr } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, alerta_texto, ativo')
    .eq('clinica_id', clinicaId)
    .order('nome_completo', { ascending: true });

  const lista = (pacientes ?? []) as Paciente[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <Link
          href="/agenda"
          className="text-sm rounded-lg px-3 py-2 border border-neutral-200 hover:bg-neutral-50"
        >
          Ir para Agenda
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {msg && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {msg}
        </div>
      )}
      {fetchErr && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          Falha ao carregar pacientes: {fetchErr.message}
        </div>
      )}

      {/* Formulário de criação */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-lg font-medium mb-3">Novo paciente</h2>
        <PacienteForm action={createPacienteAction} />
      </div>

      {/* Lista */}
      <div className="space-y-2">
        <div className="text-sm text-neutral-500">
          {lista.length === 0
            ? 'Nenhum paciente cadastrado.'
            : `${lista.length} paciente(s) encontrados.`}
        </div>

        <div className="grid gap-2">
          {lista.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl p-3 bg-white flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{p.nome_completo}</div>
                <div className="text-sm text-neutral-500">
                  REG {p.registro} • {p.cidade_nome ?? '—'}
                </div>
                {p.alerta_texto && (
                  <div className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-block">
                    {p.alerta_texto}
                  </div>
                )}
              </div>
              <div className="text-xs text-neutral-500">
                {p.ativo === false ? (
                  <span className="rounded bg-neutral-100 px-2 py-1">Inativo</span>
                ) : (
                  <span className="rounded bg-green-50 text-green-700 px-2 py-1 border border-green-200">
                    Ativo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

