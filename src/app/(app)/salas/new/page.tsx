import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Building className="w-8 h-8 mr-3 text-green-500" />
            Nova Sala
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Adicione uma nova sala de diálise ao sistema
          </p>
        </div>
        <Link href="/salas" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
          Voltar
        </Link>
      </div>

      <Card variant="elevated" className="max-w-2xl">
        <form action={createSala} className="p-6 grid gap-6">
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
      </Card>
    </div>
  );
}
