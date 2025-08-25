import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import PacienteForm from '../../_form';
import { updatePaciente } from '../../_actions';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

interface Paciente {
  id: string;
  registro: string;
  nome_completo: string;
  alerta_texto: string | null;
}

export const dynamic = 'force-dynamic';

export default async function EditPacientePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  if (!clinicaId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-800">Você precisa estar autenticado e associado a uma clínica.</p>
            <Link href="/login">
              <Button className="mt-4" variant="outline">Fazer Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-800">ID inválido</p>
            <Link href="/pacientes">
              <Button className="mt-4" variant="outline">Voltar para Pacientes</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: paciente, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, alerta_texto')
    .eq('id', params.id)
    .eq('clinica_id', clinicaId)
    .maybeSingle();

  if (error || !paciente) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-800">{error ? `Falha ao carregar paciente: ${error.message}` : 'Paciente não encontrado'}</p>
            <Link href="/pacientes">
              <Button className="mt-4" variant="outline">Voltar para Pacientes</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pacienteId = paciente.id;

  async function action(formData: FormData) {
    'use server';
    await updatePaciente(pacienteId, formData);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/pacientes">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Editar Paciente
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PacienteForm
          action={action}
          defaults={{
            registro: paciente.registro,
            nomeCompleto: paciente.nome_completo,
            alertaTexto: paciente.alerta_texto ?? '',
          }}
          isOpen={true}
          onClose={undefined}
          isEdit={true}
        />
      </div>
    </div>
  );
}

