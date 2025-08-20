import Link from 'next/link';
// import { requireAdmin } from '@/lib/roles'; // Temporariamente removido
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { updateClinicConfig } from './_actions';
import CitySelectField from './CitySelectField';

type SearchParams = { ok?: string; error?: string };

export default async function AdminConfigPage({ searchParams }: { searchParams?: SearchParams }) {
  // await requireAdmin(); // Temporariamente removido
  const supabase = createClient();
  const clinicaId = await getCurrentClinicId();

  interface Clinica {
    id: string;
    nome: string;
    cnpj?: string;
    email?: string;
    endereco?: string;
    telefone?: string;
    cidade_nome?: string;
    uf?: string;
    fuso_horario?: string;
    observacoes?: string;
  }

  // Buscar dados da clínica
  const { data: clinica } = await supabase
    .from('clinicas')
    .select('*')
    .eq('id', clinicaId)
    .single();

  const ok = searchParams?.ok;
  const err = searchParams?.error;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Configurações da Clínica</h1>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-neutral-700 hover:bg-neutral-50">
            Voltar
          </Link>
          <button form="form-config" type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
            Salvar alterações
          </button>
        </div>
      </div>

      {ok && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          {ok}
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {err}
        </div>
      )}

      <form id="form-config" action={updateClinicConfig} className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">Nome da clínica</label>
            <input name="nome" defaultValue={clinica?.nome ?? ''} required className="border rounded-md px-3 py-2" placeholder="Ex.: Clínica Modelo" />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">CNPJ</label>
            <input name="cnpj" defaultValue={clinica?.cnpj ?? ''} className="border rounded-md px-3 py-2" placeholder="00.000.000/0000-00" />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">E-mail</label>
            <input name="email" type="email" defaultValue={clinica?.email ?? ''} className="border rounded-md px-3 py-2" placeholder="contato@clinica.com.br" />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">Telefone</label>
            <input name="telefone" defaultValue={clinica?.telefone ?? ''} className="border rounded-md px-3 py-2" placeholder="(81) 99999-9999" />
          </div>

          <div className="md:col-span-2 grid gap-1.5">
            <label className="text-sm text-neutral-700">Endereço</label>
            <input name="endereco" defaultValue={clinica?.endereco ?? ''} className="border rounded-md px-3 py-2" placeholder="Rua, número, bairro" />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">Cidade (PE)</label>
            <CitySelectField defaultValue={clinica?.cidade_nome ?? ''} />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">UF</label>
            <input name="uf" defaultValue={clinica?.uf ?? 'PE'} className="border rounded-md px-3 py-2" placeholder="UF" maxLength={2} />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm text-neutral-700">Fuso horário</label>
            <select name="fuso_horario" defaultValue={clinica?.fuso_horario ?? 'America/Recife'} className="border rounded-md px-3 py-2">
              <option value="">Padrão do servidor</option>
              <option value="America/Recife">America/Recife (GMT-3, sem DST)</option>
              <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
            </select>
          </div>

          <div className="md:col-span-2 grid gap-1.5">
            <label className="text-sm text-neutral-700">Observações</label>
            <textarea name="observacoes" defaultValue={clinica?.observacoes ?? ''} className="border rounded-md px-3 py-2" rows={3} placeholder="Anotações internas sobre a clínica" />
          </div>
        </div>
      </form>
    </div>
  );
}
