export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import EscalaPacientes from '@/components/escala/EscalaPacientes';

export const metadata: Metadata = {
  title: 'Escala de Pacientes | NephroConnect',
  description: 'Gerenciamento da escala de pacientes por salas, turnos e máquinas',
};

export default function EscalaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Escala de Pacientes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie a alocação de pacientes em salas, turnos e máquinas
          </p>
        </div>
      </div>
      
      <EscalaPacientes />
    </div>
  );
}