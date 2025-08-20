import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import PacienteForm from '../../_form';
import { updatePaciente } from '../../_actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';

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

  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    redirect('/pacientes?error=' + encodeURIComponent('ID inválido'));
  }

  const { data: p, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, alerta_texto')
    .eq('id', params.id)
    .eq('clinica_id', clinicaId)
    .maybeSingle();

  if (error || !p) {
    redirect('/pacientes?error=' + encodeURIComponent(error ? `Falha ao carregar paciente: ${error.message}` : 'Paciente não encontrado'));
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

