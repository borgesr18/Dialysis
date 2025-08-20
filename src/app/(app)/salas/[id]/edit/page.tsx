import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';

export const dynamic = 'force-dynamic';

async function updateSala(id: string, fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  const nome = String(fd.get('nome') || '').trim();
  const descricao = String(fd.get('descricao') || '').trim();

  if (!nome) {
    redirect('/salas?error=' + encodeURIComponent('Nome é obrigatório'));
  }

  const { error } = await supabase
    .from('salas')
    .update({ nome, descricao: descricao || null })
    .eq('id', id)
    .eq('clinica_id', clinica_id)
    .single();

  const ok = !error ? 'Sala atualizada com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/salas${params}`);
}

export default async function EditarSalaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  // Validar formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.id)) {
    redirect('/salas?error=' + encodeURIComponent('ID inválido'));
  }

  const { data: sala } = await supabase
    .from('salas')
    .select('id, nome, descricao')
    .eq('id', params.id)
    .eq('clinica_id', clinica_id)
    .maybeSingle();

  if (!sala) {
    redirect('/salas?error=' + encodeURIComponent('Sala não encontrada'));
  }

  async function action(fd: FormData) {
    'use server';
    return updateSala(params.id, fd);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Editar Sala</h1>
        <Link
          href="/salas"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50"
        >
          Voltar
        </Link>
      </div>

      <form
        action={action}
        className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 max-w-xl"
      >
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Nome</label>
          <input className="border rounded-md px-3 py-2" name="nome" defaultValue={sala.nome} required />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Descrição</label>
          <input className="border rounded-md px-3 py-2" name="descricao" defaultValue={sala.descricao ?? ''} />
        </div>

        <div className="pt-2">
          <button
            className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
            type="submit"
          >
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}
