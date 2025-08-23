export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { getCurrentClinicId } from '@/lib/get-clinic';
import { redirect } from 'next/navigation';
import { createSessao } from '../_actions';

export default async function NovaSessaoPage() {
  const supabase = createClient();
  const clinica_id = await getCurrentClinicId();

  if (!clinica_id) {
    redirect('/dashboard?error=' + encodeURIComponent('Clínica não encontrada'));
  }

  const [{ data: pacientes }, { data: maquinas }] = await Promise.all([
    supabase
      .from('pacientes')
      .select('id, nome_completo, registro')
      .eq('clinica_id', clinica_id)
      .eq('ativo', true)
      .order('nome_completo'),
    supabase
      .from('maquinas')
      .select('id, identificador')
      .eq('clinica_id', clinica_id)
      .eq('ativa', true)
      .order('identificador'),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/sessoes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Sessão de Hemodiálise</h1>
          <p className="text-gray-600 mt-1">Agende uma nova sessão para um paciente</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <div className="p-6">
          <form action={createSessao} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paciente_id">Paciente *</Label>
                <select
                  id="paciente_id"
                  name="paciente_id"
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes?.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.nome_completo} {p.registro ? `- ${p.registro}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maquina_id">Máquina *</Label>
                <select
                  id="maquina_id"
                  name="maquina_id"
                  required
                  className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100"
                >
                  <option value="">Selecione uma máquina</option>
                  {maquinas?.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.identificador}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_sessao">Data da Sessão *</Label>
                <Input
                  id="data_sessao"
                  name="data_sessao"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hora_inicio">Hora de Início *</Label>
                <Input
                  id="hora_inicio"
                  name="hora_inicio"
                  type="time"
                  required
                  defaultValue="07:00"
                />
              </div>
            </div>

            {/* Dados Pré-Diálise */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pré-Diálise</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="peso_pre">Peso Pré (kg)</Label>
                  <Input
                    id="peso_pre"
                    name="peso_pre"
                    type="number"
                    step="0.1"
                    placeholder="Ex: 70.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pressao_arterial_pre">Pressão Arterial Pré</Label>
                  <Input
                    id="pressao_arterial_pre"
                    name="pressao_arterial_pre"
                    type="text"
                    placeholder="Ex: 120/80"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ultrafiltracao_prescrita">Ultrafiltração Prescrita (ml)</Label>
                  <Input
                    id="ultrafiltracao_prescrita"
                    name="ultrafiltracao_prescrita"
                    type="number"
                    placeholder="Ex: 2000"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="border-t pt-6">
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  rows={4}
                  placeholder="Observações sobre a sessão, condições do paciente, etc."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link href="/sessoes">
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Agendar Sessão
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}