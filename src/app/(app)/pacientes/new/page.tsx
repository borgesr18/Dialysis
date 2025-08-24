'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPaciente } from '../_actions';
import PacienteForm from '../_form';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus } from 'lucide-react';

export default function NewPacientePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  async function action(formData: FormData) {
    const result = await createPaciente(formData);
    // A função createPaciente faz redirect automaticamente em caso de sucesso
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/pacientes');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/pacientes')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Paciente
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PacienteForm 
          action={action} 
          isOpen={isModalOpen}
          onClose={handleClose}
          isEdit={false}
        />
      </div>
    </div>
  );
}
