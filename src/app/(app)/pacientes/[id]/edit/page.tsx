import { createClient } from '@/lib/supabase-server';
import PacienteForm from '../../_form';
import { updatePaciente } from '../../_actions';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditPacientePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
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
