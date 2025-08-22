import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { uploadDocumento, deleteDocumento, listDocumentos } from './documents/_actions';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

type Paciente = {
  id: string;
  registro: string;
  nome_completo: string;
  alerta_texto: string | null;
  ativo: boolean | null;
  created_at: string;
  updated_at: string;
};

// Add the missing Documento type
type Documento = {
  id: string;
  storage_path: string;
  tipo: string | null;
  created_at: string;
  url: string | null;
};

export default async function PacienteDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  const { data: p, error } = await supabase
    .from('pacientes')
    .select(
      'id, registro, nome_completo, alerta_texto, ativo, created_at, updated_at'
    )
    .eq('id', params.id)
    .eq('clinica_id', clinicaId)
    .maybeSingle();

  const docs = p ? await listDocumentos(p.id) : [];

  if (error || !p) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Paciente</h1>
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error ? `Falha ao carregar: ${error.message}` : 'Paciente não encontrado.'}
        </div>
        <Link href="/pacientes" className="text-sm underline">
          Voltar
        </Link>
      </div>
    );
  }

  const pac = p as Paciente;

  return (
    <div className="space-y-6">
      {/* Header + ações */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Paciente {pac.nome_completo}</h1>
        <div className="flex gap-2">
          <Link
            href={`/pacientes/${pac.id}/edit`}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Editar
          </Link>
          <Link
            href="/pacientes"
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Voltar
          </Link>
        </div>
      </div>

      {/* Cards superiores – grid abre em telas largas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="bg-white border rounded-xl p-5 xl:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-neutral-600">Registro (REG)</div>
              <div className="mt-1 text-xl font-semibold">{pac.registro}</div>
            </div>



            <div>
              <div className="text-sm text-neutral-600">Status</div>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 border border-green-200">
                {pac.ativo === false ? 'Inativo' : 'Ativo'}
              </div>
            </div>

            <div>
              <div className="text-sm text-neutral-600">Alerta</div>
              <div className="mt-1 text-xl font-semibold">
                {pac.alerta_texto?.trim() || '—'}
              </div>
            </div>
          </div>
        </section>

        <aside className="bg-white border rounded-xl p-5">
          <div className="text-sm text-neutral-600">Criado</div>
          <div className="mt-1 font-medium">
            {new Date(pac.created_at).toLocaleString()}
          </div>
          <div className="mt-4 text-sm text-neutral-600">Atualizado</div>
          <div className="mt-1 font-medium">
            {new Date(pac.updated_at).toLocaleString()}
          </div>
        </aside>
      </div>

      {/* Cards inferiores – abre em 3 colunas em xl */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="bg-white border rounded-xl p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Acessos / Prescrições / Serologias</h2>
            <span className="text-sm text-neutral-500">em breve</span>
          </div>
          <p className="mt-3 text-neutral-600 text-sm">
            Aqui listaremos os acessos vasculares, prescrições dialíticas e sorologias.
          </p>
        </section>

        <aside className="bg-white border rounded-xl p-5">
          <h2 className="text-lg font-semibold mb-3">Documentos</h2>

          <form
            action={async (fd: FormData) => {
              'use server';
              await uploadDocumento(pac.id, fd);
            }}
            encType="multipart/form-data"
            className="space-y-2"
          >
            <input name="arquivo" type="file" accept=".pdf,image/jpeg,image/png,image/webp" className="block w-full text-sm" />
            <button
              type="submit"
              className="mt-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Enviar
            </button>
            <p className="text-xs text-neutral-500">Máx. 10MB. Tipos: PDF, JPG, PNG, WebP.</p>
          </form>

          <div className="mt-4 space-y-2">
            {docs.length === 0 && (
              <div className="text-sm text-neutral-500">Nenhum documento enviado.</div>
            )}
            {docs.map((d: Documento) => {
              const name = String(d.storage_path).split('/').slice(-1)[0];
              return (
                <div key={d.id} className="flex items-center justify-between gap-2 border rounded-md px-3 py-2">
                  <div className="truncate text-sm">{name}</div>
                  <div className="flex items-center gap-2">
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline"
                      >
                        Baixar
                      </a>
                    )}
                    <form
                      action={async (fd: FormData) => {
                        'use server';
                        const docId = String(fd.get('docId') || '');
                        if (docId) {
                          await deleteDocumento(docId, pac.id);
                        }
                      }}
                    >
                      <input type="hidden" name="docId" value={d.id} />
                      <Button className="text-sm text-red-600 hover:underline" type="submit">
                        Excluir
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

