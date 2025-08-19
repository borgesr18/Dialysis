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
import { Monitor, Filter, Edit, Trash2 } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl space-y-6">
      <ToastContainer 
        successMessage={searchParams?.ok ? decodeURIComponent(searchParams.ok) : undefined}
        errorMessage={searchParams?.error ? decodeURIComponent(searchParams.error) : undefined}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Máquinas</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/maquinas/new" variant="primary" size="md">
            Nova Máquina
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!maquinas || maquinas.length === 0) ? (
        <EmptyState
          title="Nenhuma máquina encontrada"
          description="Comece adicionando a primeira máquina ao sistema."
          action={{
            label: "Adicionar Máquina",
            href: "/maquinas/new"
          }}
          icon={<Monitor className="h-12 w-12" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {maquinas.length} máquina(s) encontrada(s)
          </div>
          
          <Table>
            <THead>
              <TR>
                <TH>Sala</TH>
                <TH>Identificador</TH>
                <TH>Marca</TH>
                <TH>Modelo</TH>
                <TH>Série</TH>
                <TH>Status</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {maquinas.map((m) => (
                <TR key={m.id}>
                  <TD>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {salaNome.get(m.sala_id) ?? '—'}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {m.identificador}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {m.marca ?? '—'}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {m.modelo ?? '—'}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {m.serie ?? '—'}
                    </div>
                  </TD>
                  <TD>
                    <Badge variant={m.ativa ? 'success' : 'neutral'}>
                      {m.ativa ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <LinkButton
                        href={`/maquinas/${m.id}/edit`}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </LinkButton>
                      <form action={deleteMaquina.bind(null, m.id)}>
                        <FormSubmit
                          variant="ghost"
                          size="sm"
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
