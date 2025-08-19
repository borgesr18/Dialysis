import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Users, Filter, UserPlus, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

type SearchParams = {
  ok?: string;
  error?: string;
};

type Paciente = {
  id: string;
  registro: string;
  nome_completo: string;
  cidade_nome: string | null;
  ativo: boolean;
  created_at: string;
};

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, ativo, created_at')
    .eq('clinica_id', clinica_id)
    .order('nome_completo', { ascending: true });

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
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Paciente
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!pacientes || pacientes.length === 0) ? (
        <Card variant="elevated" className="p-12">
          <EmptyState
            title="Nenhum paciente encontrado"
            description="Comece adicionando o primeiro paciente ao sistema."
            action={{
              label: "Adicionar Paciente",
              href: "/pacientes/new"
            }}
            icon={<Users className="h-12 w-12" />}
          />
        </Card>
      ) : (
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Lista de Pacientes
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {pacientes.length} paciente(s) encontrado(s)
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cidade
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
                {(pacientes as Paciente[]).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {p.nome_completo.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {p.nome_completo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        REG {p.registro}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {p.cidade_nome ?? '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={p.ativo ? 'success' : 'neutral'}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LinkButton
                        href={`/pacientes/${p.id}`}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        Abrir
                      </LinkButton>
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


