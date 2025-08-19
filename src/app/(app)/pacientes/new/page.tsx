import PacienteForm from '../_form';
import { createPaciente } from '../_actions';

export const dynamic = 'force-dynamic';

export default function NewPacientePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Novo paciente</h1>
      <PacienteForm action={createPaciente} cancelHref="/pacientes" submitLabel="Criar" />
    </div>
  );
}
