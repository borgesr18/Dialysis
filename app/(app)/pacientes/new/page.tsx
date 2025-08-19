import PacienteForm from '../_form';
import { createPaciente } from '../_actions';

export const dynamic = 'force-dynamic';

export default function NewPacientePage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Novo paciente</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <PacienteForm action={createPaciente} />
      </div>
    </div>
  );
}
