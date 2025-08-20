import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Card } from '@/components/ui/Card';
import { Users, Filter, UserPlus, Activity, Edit, Trash2, Plus } from 'lucide-react';
import { pacientesService } from '@/services/pacientes';
import { Paciente } from '@/types/database';


async function deletePacienteAction(id: string) {
  'use server';
  const clinica_id = await getCurrentClinicId();
  
  if (!clinica_id) {
    redirect('/login');
  }
  
  const { error } = await pacientesService.desativarPaciente(id, clinica_id);
  const ok = !error ? 'Paciente desativado com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/pacientes${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function PacientesPage({ searchParams }: { searchParams?: SearchParams }) {
  const clinicaId = await getCurrentClinicId();
  
  if (!clinicaId) {
    redirect('/login');
  }

  const { data: pacientes, error } = await pacientesService.listarPacientes(clinicaId);

  if (error) {
    throw new Error('Falha ao carregar pacientes: ' + error.message);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ToastContainer 
        successMessage={searchParams?.ok ? decodeURIComponent(searchParams.ok) : undefined}
        errorMessage={searchParams?.error ? decodeURIComponent(searchParams.error) : undefined}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-500" />
            Pacientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerenciamento de pacientes da clínica
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/pacientes/new" className="text-white bg-gradient-medical hover:shadow-glow transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!pacientes || pacientes.length === 0) ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhum paciente encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Comece adicionando o primeiro paciente.</p>
            </div>
            <LinkButton href="/pacientes/new" className="text-white bg-gradient-medical hover:shadow-glow">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Paciente
            </LinkButton>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pacientes.map((paciente) => (
            <Card key={paciente.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center text-white font-semibold">
                    {paciente.nome_completo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {paciente.nome_completo}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      {paciente.cpf && (
                        <span>CPF: {paciente.cpf}</span>
                      )}
                      {paciente.telefone && (
                        <span>Tel: {paciente.telefone}</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paciente.ativo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {paciente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <LinkButton 
                    href={`/pacientes/${paciente.id}/edit`} 
                    variant="outline" 
                    size="sm"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </LinkButton>
                  <form action={deletePacienteAction.bind(null, paciente.id)}>
                    <DeleteButton
                      variant="ghost"
                      size="sm"
                      confirmMessage="Tem certeza que deseja excluir este paciente?"
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Excluir
                    </DeleteButton>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


