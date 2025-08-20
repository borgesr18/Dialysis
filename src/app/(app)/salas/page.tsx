import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Card } from '@/components/ui/Card';
import { Building, Filter, Edit, Trash2, Plus, Activity } from 'lucide-react';
import { salasService, deletarSala, listarSalas } from '@/services/salas';
import { Sala } from '@/types/database';

async function deleteSalaAction(id: string) {
  'use server';
  const clinica_id = await getCurrentClinicId();
  
  if (!clinica_id) {
    redirect('/login');
  }
  
  const { error } = await deletarSala(id, clinica_id);
  const ok = !error ? 'Sala excluída com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/salas${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function SalasPage({ searchParams }: { searchParams?: SearchParams }) {
  const clinicaId = await getCurrentClinicId();
  
  if (!clinicaId) {
    redirect('/login');
  }

  const { data: salas, error } = await listarSalas(clinicaId);

  if (error) {
    throw new Error('Falha ao carregar salas: ' + error.message);
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
            <Building className="w-8 h-8 mr-3 text-green-500" />
            Salas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerenciamento de salas de diálise
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/salas/new" className="text-white bg-gradient-medical hover:shadow-glow transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Nova Sala
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!salas || salas.length === 0) ? (
        <Card variant="elevated" className="p-12">
          <EmptyState
            title="Nenhuma sala encontrada"
            description="Comece adicionando a primeira sala ao sistema."
            action={{
              label: "Adicionar Sala",
              href: "/salas/new"
            }}
            icon={<Building className="h-12 w-12" />}
          />
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-500" />
                Lista de Salas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {salas.length} sala(s) encontrada(s)
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {salas.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          <Building className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {s.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {s.descricao ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LinkButton
                          href={`/salas/${s.id}/edit`}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Editar
                        </LinkButton>
                        <form action={deleteSalaAction.bind(null, s.id)}>
                          <DeleteButton
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                            confirmMessage="Tem certeza que deseja excluir esta sala?"
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Excluir
                          </DeleteButton>
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


