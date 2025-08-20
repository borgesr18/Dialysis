import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { Settings } from 'lucide-react';
import { Card } from '@/components/ui/Card';

async function createMaquina(fd: FormData) {
  'use server';
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  // Verificar se clinica_id existe
  if (!clinica_id) {
    redirect('/maquinas?error=' + encodeURIComponent('Clínica não encontrada'));
    return;
  }

  const sala_id = String(fd.get('sala_id') || '');
  const identificador = String(fd.get('identificador') || '');
  const marca = String(fd.get('marca') || '');
  const modelo = String(fd.get('modelo') || '');
  const numero_serie = String(fd.get('numero_serie') || '');
  const ativa = String(fd.get('ativa') || 'true') === 'true';

  interface MaquinaPayload {
    clinica_id: string;
    sala_id?: string;
    identificador: string;
    marca?: string;
    modelo?: string;
    numero_serie?: string;
    ativa: boolean;
  }

  const insertPayload: MaquinaPayload = {
    clinica_id,
    identificador,
    ativa,
  };
  
  if (sala_id) insertPayload.sala_id = sala_id;
  if (marca) insertPayload.marca = marca;
  if (modelo) insertPayload.modelo = modelo;
  if (numero_serie) insertPayload.numero_serie = numero_serie;

  const { error } = await supabase.from('maquinas').insert(insertPayload);

  const ok = !error ? 'Máquina criada com sucesso' : '';
  const err = error ? encodeURIComponent(error.message) : '';
  const params = ok ? `?ok=${encodeURIComponent(ok)}` : err ? `?error=${err}` : '';
  redirect(`/maquinas${params}`);
}

export default async function NovaMaquinaPage() {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();
  
  // Verificar se clinica_id existe
  if (!clinica_id) {
    redirect('/dashboard?error=' + encodeURIComponent('Clínica não encontrada'));
    return;
  }
  
  const { data: salas } = await supabase
    .from('salas')
    .select('id, nome')
    .eq('clinica_id', clinica_id)
    .order('nome');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Máquina</h1>
          <p className="text-gray-600">Cadastre uma nova máquina de hemodiálise</p>
        </div>
      </div>

      <Card className="p-6">
        <form action={createMaquina} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Identificador *
            </label>
            <input
              name="identificador"
              required
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="Ex: MAQ-001"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Sala
            </label>
            <select
              name="sala_id"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="">Selecione uma sala</option>
              {salas?.map((sala: any) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Marca
            </label>
            <input
              name="marca"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="Ex: Fresenius"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Modelo
            </label>
            <input
              name="modelo"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="Ex: 4008S"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Número de Série
            </label>
            <input
              name="numero_serie"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
              placeholder="Ex: ABC123456"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Status
            </label>
            <select
              name="ativa"
              defaultValue="true"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
            >
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
          </div>
        </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/maquinas"
              className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Criar Máquina
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
