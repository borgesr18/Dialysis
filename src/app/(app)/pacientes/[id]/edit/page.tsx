import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import PacienteForm from '../../_form';
import { updatePaciente } from '../../_actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EditPacientePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: p, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, alerta_texto')
    .eq('id', params.id)
    .eq('clinica_id', clinicaId)
    .maybeSingle();

  if (error || !p) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Editar paciente</h1>
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error ? `Falha ao carregar paciente: ${error.message}` : 'Paciente não encontrado.'}
        </div>
        <Link href="/pacientes" className="text-sm underline">
          Voltar
        </Link>
      </div>
    );
  }

  const action = updatePaciente.bind(null, p.id);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Editar paciente</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <PacienteForm
          action={action}
          defaults={{
            registro: p.registro,
            nomeCompleto: p.nome_completo,
            cidadeNome: p.cidade_nome,
            alertaTexto: p.alerta_texto ?? '',
          }}
        />
      </div>
    </div>
  );
}

