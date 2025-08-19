import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function PacienteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: p, error } = await supabase
    .from('pacientes')
    .select('id, registro, nome_completo, cidade_nome, alerta_texto, ativo, created_at, updated_at')
    .eq('id', params.id)
    .maybeSingle();

  if (error) throw error;
  if (!p) return notFound();

  return (
    <div className="space-y-4">
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

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="label">Registro (REG)</div>
              <div className="font-medium">{p.registro}</div>
            </div>
            <div>
              <div className="label">Cidade</div>
              <div className="font-medium">{p.cidade_nome ?? '—'}</div>
            </div>
            <div>
              <div className="label">Status</div>
              <div className="font-medium">
                {p.ativo ? <span className="chip bg-green-50 text-green-700">Ativo</span> : <span className="chip bg-gray-100 text-gray-700">Inativo</span>}
              </div>
            </div>
            <div>
              <div className="label">Alerta</div>
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

      {/* slots para evoluções futuras */}
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

        <div className="card">
          <h2 className="font-semibold mb-2">Documentos</h2>
          <p className="text-sm text-neutral-600">Upload/download pelo bucket <code>documentos</code> (em breve).</p>
        </div>
      </div>
    </div>
  );
}
