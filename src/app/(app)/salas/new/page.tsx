import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function createSala(fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  const { error } = await supabase.from('salas').insert({
    clinica_id,
    nome: String(fd.get('nome') || ''),
    descricao: String(fd.get('descricao') || ''),
  });
  const ok = !error ? 'Sala criada com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/salas${params}`);
}

export default function NovaSalaPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nova Sala</h1>
        <Link href="/salas" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
          Voltar
        </Link>
      </div>

      <form action={createSala} className="rounded-xl border border-neutral-200 bg-white p-4 grid gap-3 max-w-xl">
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Nome</label>
          <input className="input border rounded-md px-3 py-2" name="nome" placeholder="Nome da sala" required />
        </div>
        <div className="grid gap-1.5">
          <label className="text-sm text-neutral-700">Descrição</label>
          <input className="input border rounded-md px-3 py-2" name="descricao" placeholder="Descrição" />
        </div>
        <div className="pt-2">
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700" type="submit">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
