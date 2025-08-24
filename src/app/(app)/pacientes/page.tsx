import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { createClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { User, Filter, Edit, Trash2, Plus, Calendar, Phone, AlertTriangle } from 'lucide-react';
import { deletePaciente } from './_actions';

export const dynamic = 'force-dynamic';

interface Paciente {
  id: string;
  registro: string;
  nome_completo: string;
  data_nascimento: string | null;
  sexo: string | null;
  telefone: string | null;
  cpf: string | null;
  endereco: string | null;
  convenio: string | null;
  numero_convenio: string | null;
  codigo_ibge: number | null;
  ativo: boolean;
  alerta_texto: string | null;
  created_at: string;
  updated_at: string;
  clinica_id: string;
}

type SearchParams = { ok?: string; error?: string };

export default async function PacientesPage({ searchParams }: { searchParams?: SearchParams }) {
  let clinicaId: string | null = null;
  let pacientes: Paciente[] = [];
  let error: any = null;

  try {
    clinicaId = await getCurrentClinicId();
    
    if (!clinicaId) {
      redirect('/login');
    }

    const supabase = createClient();
    const result = await supabase
      .from('pacientes')
      .select('*')
      .eq('clinica_id', clinicaId)
      .eq('ativo', true)
      .order('nome_completo', { ascending: true });

    if (result.error) {
      console.error('Erro ao carregar pacientes:', result.error.message);
      error = result.error;
    } else {
      pacientes = result.data || [];
    }
  } catch (err) {
    console.error('Erro na página de pacientes:', err);
    error = err;
    // Se houver erro de autenticação, redirecionar para login
    if (err instanceof Error && err.message.includes('permission denied')) {
      redirect('/login');
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAge = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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
            <User className="w-8 h-8 mr-3 text-blue-500" />
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

      {/* Mensagem de erro */}
      {error && (
        <Card className="p-12 text-center border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-900 dark:text-red-100">Erro ao carregar pacientes</h3>
              <p className="text-red-600 dark:text-red-400 mt-1">
                {error.message || 'Ocorreu um erro inesperado. Tente fazer login novamente.'}
              </p>
            </div>
            <LinkButton href="/login" className="text-white bg-red-600 hover:bg-red-700">
              Fazer Login
            </LinkButton>
          </div>
        </Card>
      )}

      {/* Lista de Pacientes */}
      {!error && (!pacientes || pacientes.length === 0) ? (
        <EmptyState
          title="Nenhum paciente cadastrado"
          description="Comece adicionando o primeiro paciente da clínica."
          action={{
            label: "Novo Paciente",
            href: "/pacientes/new"
          }}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registro/CPF
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Idade/Sexo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Alertas
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {pacientes.map((paciente: Paciente) => (
                  <tr key={paciente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {paciente.nome_completo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{paciente.registro}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{paciente.cpf || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {getAge(paciente.data_nascimento) ? `${getAge(paciente.data_nascimento)} anos` : 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Feminino' : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {paciente.telefone ? (
                          <>
                            <Phone className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-gray-100">{paciente.telefone}</span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {paciente.alerta_texto ? (
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-400 truncate max-w-xs">
                            {paciente.alerta_texto}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <LinkButton
                          href={`/pacientes/${paciente.id}/edit`}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </LinkButton>
                        <form action={deletePaciente.bind(null, paciente.id)} className="inline">
                          <Button 
                            type="submit"
                            variant="outline" 
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}


