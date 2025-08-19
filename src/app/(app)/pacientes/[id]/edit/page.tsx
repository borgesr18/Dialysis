import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import PacienteForm from '../../_form';
import { updatePaciente } from '../../_actions';

export const dynamic = 'force-dynamic';

export default async function EditPacientePage({ params }: { params: { id: string } }) {
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) redirect('/onboarding');

  const supabase = createClient();

  // Busca o paciente; o RLS do Supabase já restringe por clínica.
  const { data, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, alerta_texto')
    .eq('id', params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return notFound();

  async function action(fd: FormData) {
    'use server';
    await updatePaciente(params.id, fd);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Editar paciente</h1>
      <PacienteForm
        action={action}
        initial={{
          registro: data.registro,
          nome_completo: data.nome_completo,
          cidade_nome: data.cidade_nome,
          alerta_texto: data.alerta_texto,
        }}
        cancelHref={`/pacientes/${data.id}`}
        submitLabel="Salvar alterações"
      />
    </div>
  );
}

