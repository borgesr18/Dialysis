import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { createClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Settings, Filter, Edit, Trash2, Plus, Activity } from 'lucide-react';
import { Maquina } from '@/types/database';

export const dynamic = 'force-dynamic';


async function deleteMaquinaAction(id: string) {
  'use server';
  const clinica_id = await getCurrentClinicId();
  
  if (!clinica_id) {
    redirect('/login');
  }
  
  const supabase = createClient();
  const { error } = await supabase
    .from('maquinas')
    .update({ ativa: false })
    .eq('id', id)
    .eq('clinica_id', clinica_id);
    
  const ok = !error ? 'Máquina desativada com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function MaquinasPage({ searchParams }: { searchParams?: SearchParams }) {
  let clinicaId: string | null = null;
  let maquinas: Maquina[] = [];
  let error: any = null;

  try {
    clinicaId = await getCurrentClinicId();
    
    if (!clinicaId) {
      redirect('/login');
    }

    const supabase = createClient();
    const result = await supabase
      .from('maquinas')
      .select('*')
      .eq('clinica_id', clinicaId)
      .eq('ativa', true)
      .order('identificador', { ascending: true });

    if (result.error) {
      console.error('Erro ao carregar máquinas:', result.error.message);
      error = result.error;
    } else {
      maquinas = result.data || [];
    }
  } catch (err) {
    console.error('Erro na página de máquinas:', err);
    error = err;
    // Se houver erro de autenticação, redirecionar para login
    if (err instanceof Error && err.message.includes('permission denied')) {
      redirect('/login');
    }
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
            <Settings className="w-8 h-8 mr-3 text-blue-500" />
            Máquinas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerenciamento de máquinas de hemodiálise
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/maquinas/new" className="text-white bg-gradient-medical hover:shadow-glow transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Nova Máquina
          </LinkButton>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Card className="p-12 text-center border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-900 dark:text-red-100">Erro ao carregar máquinas</h3>
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

      {/* Lista de Máquinas */}
      {!error && (!maquinas || maquinas.length === 0) ? (
        <EmptyState
          title="Nenhuma máquina cadastrada"
          description="Comece adicionando a primeira máquina de hemodiálise da clínica."
          action={{
            label: "Nova Máquina",
            href: "/maquinas/new"
          }}
        />
      ) : (
        <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                     Observações
                   </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {maquinas.map((maquina: Maquina) => (
                  <tr key={maquina.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-blue-500 mr-3" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {maquina.identificador}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{maquina.modelo}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{maquina.marca || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          maquina.ativa
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                         {maquina.ativa ? 'Ativa' : 'Inativa'}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                       N/A
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <LinkButton
                          href={`/maquinas/${maquina.id}/edit`}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900"
                          prefetch={false}
                        >
                          <Edit className="h-4 w-4" />
                        </LinkButton>
                        <form action={deleteMaquinaAction.bind(null, maquina.id)} className="inline">
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
