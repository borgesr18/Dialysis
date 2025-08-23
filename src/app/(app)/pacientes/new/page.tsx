import { Users } from 'lucide-react';
import PacienteForm from '../_form';
import { createPaciente } from '../_actions';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default function NewPacientePage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-500" />
          Novo Paciente
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Adicione um novo paciente ao sistema
        </p>
      </div>

      {searchParams?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}

      {/* Form */}
      <Card className="p-6">
        <PacienteForm action={createPaciente} />
      </Card>
    </div>
  );
}
