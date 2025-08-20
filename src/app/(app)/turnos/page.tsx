import { redirect } from 'next/navigation';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { createClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { DeleteButton } from '@/components/ui/DeleteButton';
import { Card } from '@/components/ui/Card';
import { Clock, Filter, Edit, Trash2, Plus, Activity } from 'lucide-react';
import { Turno } from '@/types/database';

async function deleteTurnoAction(id: string) {
  'use server';
  try {
    const clinica_id = await getCurrentClinicId();
    
    if (!clinica_id) {
      redirect('/login');
    }
    
    const supabase = createClient();
    const { error } = await supabase
      .from('turnos')
      .delete()
      .eq('id', id)
      .eq('clinica_id', clinica_id);
    
    const ok = !error ? 'Turno excluído com sucesso' : '';
    const err = error ? encodeURIComponent(error.message) : '';
    const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
    redirect(`/turnos${params}`);
  } catch (error) {
    console.error('Erro ao deletar turno:', error);
    redirect('/login');
  }
}

type SearchParams = { ok?: string; error?: string };

export default async function TurnosPage({ searchParams }: { searchParams?: SearchParams }) {
  let turnos: Turno[] = [];
  let error: Error | null = null;
  
  try {
    const clinicaId = await getCurrentClinicId();
    
    if (!clinicaId) {
      redirect('/login');
    }

    const supabase = createClient();
    const { data, error: supabaseError } = await supabase
      .from('turnos')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('nome');

    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    turnos = data || [];
  } catch (err) {
    console.error('Erro ao carregar turnos:', err);
    error = err instanceof Error ? err : new Error('Erro desconhecido');
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
            <Clock className="w-8 h-8 mr-3 text-blue-500" />
            Turnos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerenciamento de turnos de trabalho
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="md" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/turnos/new" className="text-white bg-gradient-medical hover:shadow-glow transition-all duration-200">
            <Plus className="mr-2 h-4 w-4" />
            Novo Turno
          </LinkButton>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Card className="p-12 text-center border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-red-900 dark:text-red-100">Erro ao carregar turnos</h3>
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

      {/* Lista */}
      {!error && (!turnos || turnos.length === 0) ? (
        <Card variant="elevated" className="p-12">
          <EmptyState
            title="Nenhum turno encontrado"
            description="Comece adicionando o primeiro turno ao sistema."
            action={{
              label: "Adicionar Turno",
              href: "/turnos/new"
            }}
            icon={<Clock className="h-12 w-12" />}
          />
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Lista de Turnos
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {turnos.length} turno(s) encontrado(s)
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Turno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dias da Semana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {turnos.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {t.nome}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {String(t.hora_inicio)}–{String(t.hora_fim)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {Array.isArray(t.dias_semana) ? t.dias_semana.join(', ') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <LinkButton
                          href={`/turnos/${t.id}/edit`}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Editar
                        </LinkButton>
                        <form action={deleteTurnoAction.bind(null, t.id)}>
                          <DeleteButton
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                            confirmMessage="Tem certeza que deseja excluir este turno?"
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

