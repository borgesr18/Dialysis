import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { FormSubmit } from '@/components/ui/FormSubmit';
import { Building, Filter, Edit, Trash2 } from 'lucide-react';

async function deleteSala(id: string) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { error } = await supabase
    .from('salas')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);
  const ok = !error ? 'Sala excluída com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/salas${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function SalasPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: salas } = await supabase
    .from('salas')
    .select('*')
    .eq('clinica_id', clinicaId)
    .order('nome');

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToastContainer 
        successMessage={searchParams?.ok ? decodeURIComponent(searchParams.ok) : undefined}
        errorMessage={searchParams?.error ? decodeURIComponent(searchParams.error) : undefined}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Salas</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/salas/new" variant="primary" size="md">
            Nova Sala
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!salas || salas.length === 0) ? (
        <EmptyState
          title="Nenhuma sala encontrada"
          description="Comece adicionando a primeira sala ao sistema."
          action={{
            label: "Adicionar Sala",
            href: "/salas/new"
          }}
          icon={<Building className="h-12 w-12" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {salas.length} sala(s) encontrada(s)
          </div>
          
          <Table>
            <THead>
              <TR>
                <TH>Nome</TH>
                <TH>Descrição</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {salas.map((s) => (
                <TR key={s.id}>
                  <TD>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {s.nome}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {s.descricao ?? '—'}
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <LinkButton
                        href={`/salas/${s.id}/edit`}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </LinkButton>
                      <form action={deleteSala.bind(null, s.id)}>
                        <FormSubmit
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            if (!confirm('Tem certeza que deseja excluir esta sala?')) {
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


