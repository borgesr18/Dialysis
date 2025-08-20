import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Settings, Filter, Edit, Trash2, Plus, Activity } from 'lucide-react';
import { maquinasService, listarMaquinas } from '@/services/maquinas';
import { Maquina } from '@/types/database';
import { deletarMaquina } from '@/services/maquinas';


async function deleteMaquinaAction(id: string) {
  'use server';
  const clinica_id = await getCurrentClinicId();
  
  if (!clinica_id) {
    redirect('/login');
  }
  
  const { error } = await deletarMaquina(id, clinica_id);
  const ok = !error ? 'Máquina excluída com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function MaquinasPage({ searchParams }: { searchParams?: SearchParams }) {
  const clinicaId = await getCurrentClinicId();
  
  if (!clinicaId) {
    redirect('/login');
  }

  const { data: maquinas, error } = await listarMaquinas(clinicaId);

  if (error) {
    throw new Error('Falha ao carregar máquinas: ' + error.message);
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

      {/* Lista de Máquinas */}
      {!maquinas || maquinas.length === 0 ? (
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
                          {maquina.numero}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{maquina.modelo}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{maquina.fabricante}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                         maquina.status === 'ativa' 
                           ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                           : maquina.status === 'manutencao'
                           ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                           : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                       }`}>
                         {maquina.status === 'ativa' ? 'Ativa' : maquina.status === 'manutencao' ? 'Manutenção' : 'Inativa'}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                       {maquina.observacoes || 'N/A'}
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <LinkButton
                          href={`/maquinas/${maquina.id}/edit`}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-900"
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
