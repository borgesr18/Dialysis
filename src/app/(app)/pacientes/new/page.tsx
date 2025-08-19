import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import PacienteForm from '../_form';
import { createPaciente } from '../_actions';

export const dynamic = 'force-dynamic';

export default async function NewPacientePage() {
  // Garante que o usuário tenha um vínculo antes de abrir o formulário
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) redirect('/onboarding');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Novo paciente</h1>
      <PacienteForm action={createPaciente} cancelHref="/pacientes" submitLabel="Criar" />
    </div>
  );
}
