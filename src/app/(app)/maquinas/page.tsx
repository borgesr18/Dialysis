import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { FormSubmit } from '@/components/ui/FormSubmit';
import { Card } from '@/components/ui/Card';
import { Monitor, Filter, Edit, Trash2, Plus, Activity } from 'lucide-react';

async function deleteMaquina(id: string) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { error } = await supabase
    .from('maquinas')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);
  const ok = !error ? 'Máquina excluída com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function MaquinasPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const [{ data: maquinas }, { data: salas }] = await Promise.all([
    supabase
      .from('maquinas')
      .select('id, sala_id, identificador, marca, modelo, serie, ativa')
      .eq('clinica_id', clinica_id)
      .order('identificador', { ascending: true }),
    supabase
      .from('salas')
      .select('id, nome')
      .eq('clinica_id', clinica_id)
      .order('nome', { ascending: true }),
  ]);

  const salaNome = new Map((salas ?? []).map((s) => [s.id, s.nome as string]));

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
            <Monitor className="w-8 h-8 mr-3 text-purple-500" />
            Máquinas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerenciamento de equipamentos de diálise
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

      {/* Lista */}
      {(!maquinas || maquinas.length === 0) ? (
        <Card variant="elevated" className="p-12">
          <EmptyState
            title="Nenhuma máquina encontrada"
            description="Comece adicionando a primeira máquina ao sistema."
            action={{
              label: "Adicionar Máquina",
              href: "/maquinas/new"
            }}
            icon={<Monitor className="h-12 w-12" />}
          />
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Lista de Máquinas
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {maquinas.length} máquina(s) encontrada(s)
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Equipamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Especificações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {maquinas.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {m.identificador}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Série: {m.serie ?? '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200">
                        {salaNome.get(m.sala_id) ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {m.marca ?? '—'} {m.modelo ?? ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={m.ativa ? 'success' : 'neutral'}>
                        {m.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LinkButton
                          href={`/maquinas/${m.id}/edit`}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Editar
                        </LinkButton>
                        <form action={deleteMaquina.bind(null, m.id)}>
                          <FormSubmit
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                            onClick={(e) => {
                              if (!confirm('Tem certeza que deseja excluir esta máquina?')) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Excluir
                          </FormSubmit>
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
