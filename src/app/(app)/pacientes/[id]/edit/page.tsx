'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import PacienteForm from '../../_form';
import { updatePaciente } from '../../_actions';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Edit } from 'lucide-react';

interface Paciente {
  id: string;
  registro: string;
  nome_completo: string;
  alerta_texto: string | null;
}

export default function EditPacientePage() {
  const router = useRouter();
  const params = useParams();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    async function loadPaciente() {
      try {
        const supabase = createClient();
        
        // Validar formato UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(params.id as string)) {
          setError('ID inválido');
          return;
        }

        // Obter clinica_id do usuário autenticado (igual à lógica do servidor)
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          setError('Usuário não autenticado');
          return;
        }

        const { data: clinicRow, error: clinicError } = await supabase
          .from('usuarios_clinicas')
          .select('clinica_id')
          .eq('user_id', authData.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (clinicError || !clinicRow?.clinica_id) {
          setError('Clínica não encontrada para o usuário');
          return;
        }

        const { data: p, error: queryError } = await supabase
          .from('pacientes')
          .select('id, registro, nome_completo, alerta_texto')
          .eq('id', params.id)
          .eq('clinica_id', clinicRow.clinica_id)
          .maybeSingle();

        if (queryError) {
          setError(`Falha ao carregar paciente: ${queryError.message}`);
          return;
        }

        if (!p) {
          setError('Paciente não encontrado');
          return;
        }

        setPaciente(p);
      } catch (err) {
        console.error('Erro ao carregar paciente:', err);
        setError('Erro inesperado ao carregar paciente');
      } finally {
        setLoading(false);
      }
    }

    loadPaciente();
  }, [params.id]);

  async function action(formData: FormData) {
    if (!paciente) return;
    
    const result = await updatePaciente(paciente.id, formData);
    // A função updatePaciente faz redirect automaticamente em caso de sucesso
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/pacientes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando paciente...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
            <p className="text-red-800">{error}</p>
            <Button
              onClick={() => router.push('/pacientes')}
              className="mt-4"
              variant="outline"
            >
              Voltar para Pacientes
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                <Edit className="h-5 w-5" />
                Editar Paciente
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {paciente && (
          <PacienteForm
            action={action}
            defaults={{
              registro: paciente.registro,
              nomeCompleto: paciente.nome_completo,
              alertaTexto: paciente.alerta_texto ?? '',
            }}
            isOpen={isModalOpen}
            onClose={handleClose}
            isEdit={true}
          />
        )}
      </div>
    </div>
  );
}

