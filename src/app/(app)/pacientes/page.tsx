import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { Users, Filter } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl space-y-6">
      <ToastContainer 
        successMessage={searchParams?.ok ? decodeURIComponent(searchParams.ok) : undefined}
        errorMessage={searchParams?.error ? decodeURIComponent(searchParams.error) : undefined}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Pacientes</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/pacientes/new" variant="primary" size="md">
            Novo Paciente
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!pacientes || pacientes.length === 0) ? (
        <EmptyState
          title="Nenhum paciente encontrado"
          description="Comece adicionando o primeiro paciente ao sistema."
          action={{
            label: "Adicionar Paciente",
            href: "/pacientes/new"
          }}
          icon={<Users className="h-12 w-12" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {pacientes.length} paciente(s) encontrado(s)
          </div>
          
          <Table>
            <THead>
              <TR>
                <TH>Nome</TH>
                <TH>Registro</TH>
                <TH>Cidade</TH>
                <TH>Status</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {(pacientes as Paciente[]).map((p) => (
                <TR key={p.id}>
                  <TD>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {p.nome_completo}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      REG {p.registro}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {p.cidade_nome ?? '—'}
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={p.ativo ? 'success' : 'neutral'}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TD>
                  <TD>
                    <LinkButton
                      href={`/pacientes/${p.id}`}
                      variant="ghost"
                      size="sm"
                    >
                      Abrir
                    </LinkButton>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}


