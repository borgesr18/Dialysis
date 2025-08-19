import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { uploadDocumento, deleteDocumento } from './documents/_actions';

export const dynamic = 'force-dynamic';

type DocRow = {
  id: string;
  storage_path: string;
  tipo: string | null;
  created_at: string | null;
};

export default async function PacienteDetailPage({ params }: { params: { id: string } }) {
  const clinicaId = await getCurrentClinicId();
  if (!clinicaId) redirect('/onboarding');

  const supabase = createClient();

  // Paciente
  const { data: p, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, alerta_texto, ativo, created_at, updated_at')
    .eq('id', params.id)
    .maybeSingle();
  if (error) throw error;
  if (!p) return notFound();

  // Documentos (metadados)
  const { data: docs, error: dErr } = await supabase
    .from('docs_paciente')
    .select('id, storage_path, tipo, created_at')
    .eq('paciente_id', params.id)
    .order('created_at', { ascending: false });
  if (dErr) throw dErr;

  // Gera URLs assinadas (15 minutos) para cada documento
  const storage = supabase.storage.from('documentos');
  const signedDocs = await Promise.all(
    (docs ?? []).map(async (d: DocRow) => {
      const { data: signed, error: sErr } = await storage.createSignedUrl(d.storage_path, 60 * 15);
      // Mesmo que falhe o signed, mantemos o item na UI (sem link)
      return {
        ...d,
        url: signed?.signedUrl || null,
        nome: d.storage_path.split('/').pop() || 'arquivo',
      };
    })
  );

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{p.nome_completo}</h1>
        <div className="flex gap-2">
          <Link className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm" href={`/pacientes/${p.id}/edit`}>
            <i className="fa-solid fa-pen-to-square mr-1" /> Editar
          </Link>
          <Link className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm" href="/pacientes">
            Voltar
          </Link>
        </div>
      </div>

      {/* Dados principais */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-neutral-600">Registro (REG)</div>
              <div className="font-medium">{p.registro}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Cidade</div>
              <div className="font-medium">{p.cidade_nome ?? '—'}</div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Status</div>
              <div className="font-medium">
                {p.ativo ? (
                  <span className="chip bg-green-50 text-green-700">Ativo</span>
                ) : (
                  <span className="chip bg-gray-100 text-gray-700">Inativo</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Alerta</div>
              <div className="font-medium">{p.alerta_texto ?? '—'}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="text-sm text-neutral-600">Criado</div>
          <div className="font-medium">{new Date(p.created_at as any).toLocaleString()}</div>
          <div className="text-sm text-neutral-600 mt-2">Atualizado</div>
          <div className="font-medium">{new Date(p.updated_at as any).toLocaleString()}</div>
        </div>
      </div>

      {/* Bloco clínico futuro */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Acessos / Prescrições / Serologias</h2>
            <span className="text-sm text-neutral-500">em breve</span>
          </div>
          <p className="text-sm text-neutral-600">
            Aqui listaremos os acessos vasculares, prescrições dialíticas e sorologias.
          </p>
        </div>

        {/* Documentos do paciente */}
        <div className="card">
          <h2 className="font-semibold mb-3">Documentos</h2>

          {/* Upload */}
          <form
            action={async (fd) => {
              'use server';
              await uploadDocumento(p.id, fd);
            }}
            encType="multipart/form-data"
            className="mb-4"
          >
            <input
              type="file"
              name="arquivo"
              accept="application/pdf,image/*"
              className="block w-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              required
            />
            <div className="flex justify-end mt-2">
              <button type="submit" className="btn">
                <i className="fa-solid fa-upload mr-2" />
                Enviar
              </button>
            </div>
          </form>

          {/* Lista */}
          <div className="space-y-2">
            {signedDocs.length === 0 && (
              <div className="text-sm text-neutral-500">Nenhum documento enviado.</div>
            )}

            {signedDocs.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="min-w-0">
                  <div className="truncate font-medium text-sm">{d.nome}</div>
                  <div className="text-xs text-neutral-500">
                    {(d.tipo ?? 'arquivo')} • {d.created_at ? new Date(d.created_at).toLocaleString() : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm"
                    >
                      <i className="fa-solid fa-download mr-1" />
                      Baixar
                    </a>
                  ) : (
                    <span className="text-xs text-red-600">sem acesso</span>
                  )}

                  <form
                    action={async () => {
                      'use server';
                      await deleteDocumento(d.id, p.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md border hover:bg-red-50 text-sm text-red-600"
                    >
                      <i className="fa-solid fa-trash mr-1" />
                      Excluir
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-neutral-500 mt-3">
            O bucket <code>documentos</code> é privado. Os links de download são assinados e expiram em 15 minutos.
          </p>
        </div>
      </div>
    </div>
  );
}

