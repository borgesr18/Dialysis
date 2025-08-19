import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { FormSubmit } from '@/components/ui/FormSubmit';
import { Clock, Filter, Edit, Trash2 } from 'lucide-react';

async function deleteTurno(id: string) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { error } = await supabase
    .from('turnos')
    .delete()
    .eq('id', id)
    .eq('clinica_id', clinica_id);
  const ok = !error ? 'Turno excluído com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/turnos${params}`);
}

type SearchParams = { ok?: string; error?: string };

export default async function TurnosPage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: turnos, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('clinica_id', clinicaId)
    .order('nome');

  if (error) {
    throw new Error('Falha ao carregar turnos: ' + error.message);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ToastContainer 
        successMessage={searchParams?.ok ? decodeURIComponent(searchParams.ok) : undefined}
        errorMessage={searchParams?.error ? decodeURIComponent(searchParams.error) : undefined}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Turnos</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <LinkButton href="/turnos/new" variant="primary" size="md">
            Novo Turno
          </LinkButton>
        </div>
      </div>

      {/* Lista */}
      {(!turnos || turnos.length === 0) ? (
        <EmptyState
          title="Nenhum turno encontrado"
          description="Comece adicionando o primeiro turno ao sistema."
          action={{
            label: "Adicionar Turno",
            href: "/turnos/new"
          }}
          icon={<Clock className="h-12 w-12" />}
        />
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {turnos.length} turno(s) encontrado(s)
          </div>
          
          <Table>
            <THead>
              <TR>
                <TH>Nome</TH>
                <TH>Horário</TH>
                <TH>Dias da Semana</TH>
                <TH>Ações</TH>
              </TR>
            </THead>
            <TBody>
              {turnos.map((t) => (
                <TR key={t.id}>
                  <TD>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {t.nome}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {String(t.hora_inicio)}–{String(t.hora_fim)}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {Array.isArray(t.dias_semana) ? t.dias_semana.join(', ') : '—'}
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <LinkButton
                        href={`/turnos/${t.id}/edit`}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Editar
                      </LinkButton>
                      <form action={deleteTurno.bind(null, t.id)}>
                        <FormSubmit
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            if (!confirm('Tem certeza que deseja excluir este turno?')) {
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

