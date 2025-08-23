import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Save, Play, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { startSessao, finalizarSessao, updateSessao } from '../_actions';

interface SessaoPageProps {
  params: {
    id: string;
  };
}

export default async function SessaoPage({ params }: SessaoPageProps) {
  const supabase = createClient();

  const { data: sessao, error } = await supabase
    .from('sessoes_hemodialise')
    .select(`
      *,
      paciente:pacientes!inner(id, nome_completo, registro),
      maquina:maquinas!inner(id, identificador)
    `)
    .eq('id', params.id)
    .maybeSingle();

  if (error || !sessao) {
    redirect('/sessoes?error=' + encodeURIComponent('Sessão não encontrada'));
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AGENDADA': { color: 'bg-blue-100 text-blue-800', label: 'Agendada' },
      'EM_ANDAMENTO': { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      'CONCLUIDA': { color: 'bg-green-100 text-green-800', label: 'Concluída' },
      'CANCELADA': { color: 'bg-red-100 text-red-800', label: 'Cancelada' }
    } as const;
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['AGENDADA'];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/sessoes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sessão #{sessao.id} - {sessao.paciente?.nome_completo}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(sessao.data_sessao).toLocaleDateString('pt-BR')} às {sessao.hora_inicio}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(sessao.status)}
          {sessao.status === 'AGENDADA' && (
            <form action={async () => { 'use server'; await startSessao(sessao.id); }}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Sessão
              </Button>
            </form>
          )}
          {sessao.status === 'EM_ANDAMENTO' && (
            <form action={async (fd: FormData) => { 'use server'; await finalizarSessao(sessao.id, fd); }}>
              <input type="hidden" name="hora_fim" value={new Date().toISOString().slice(11,16)} />
              <Button className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Sessão
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações da Sessão */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações da Sessão</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{sessao.paciente?.nome_completo}</p>
                    <p className="text-sm text-gray-600">Registro: {sessao.paciente?.registro}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Máquina</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{sessao.maquina?.identificador}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data e Horário</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {new Date(sessao.data_sessao).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sessao.hora_inicio} - {sessao.hora_fim || 'Em andamento'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getStatusBadge(sessao.status)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Dados Clínicos */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados Clínicos</h2>
              <form action={async (fd: FormData) => { 'use server'; await updateSessao(sessao.id, fd); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="peso_pre">Peso Pré (kg)</Label>
                    <Input
                      id="peso_pre"
                      name="peso_pre"
                      type="number"
                      step="0.1"
                      defaultValue={sessao.peso_pre ?? undefined}
                      disabled={sessao.status === 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peso_pos">Peso Pós (kg)</Label>
                    <Input
                      id="peso_pos"
                      name="peso_pos"
                      type="number"
                      step="0.1"
                      defaultValue={sessao.peso_pos ?? undefined}
                      disabled={sessao.status !== 'EM_ANDAMENTO' && sessao.status !== 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pressao_arterial_pre">Pressão Arterial Pré</Label>
                    <Input
                      id="pressao_arterial_pre"
                      name="pressao_arterial_pre"
                      defaultValue={sessao.pressao_arterial_pre ?? ''}
                      disabled={sessao.status === 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pressao_arterial_pos">Pressão Arterial Pós</Label>
                    <Input
                      id="pressao_arterial_pos"
                      name="pressao_arterial_pos"
                      defaultValue={sessao.pressao_arterial_pos ?? ''}
                      disabled={sessao.status !== 'EM_ANDAMENTO' && sessao.status !== 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ultrafiltracao_prescrita">Ultrafiltração Prescrita (ml)</Label>
                    <Input
                      id="ultrafiltracao_prescrita"
                      name="ultrafiltracao_prescrita"
                      type="number"
                      defaultValue={sessao["ultrafiltração_prescrita"] ?? undefined}
                      disabled={sessao.status === 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ultrafiltracao_realizada">Ultrafiltração Realizada (ml)</Label>
                    <Input
                      id="ultrafiltracao_realizada"
                      name="ultrafiltracao_realizada"
                      type="number"
                      defaultValue={sessao["ultrafiltração_realizada"] ?? undefined}
                      disabled={sessao.status !== 'EM_ANDAMENTO' && sessao.status !== 'CONCLUIDA'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    rows={4}
                    defaultValue={sessao.observacoes ?? ''}
                    disabled={sessao.status === 'CONCLUIDA'}
                  />
                </div>

                {sessao.status !== 'CONCLUIDA' && (
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar com Resumo */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Sessão</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">{sessao.hora_fim ? calcularDuracao(sessao.hora_inicio, sessao.hora_fim) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Perda de Peso:</span>
                  <span className="font-medium {sessao.peso_pre && sessao.peso_pos ? 'text-green-600' : ''}">
                    {sessao.peso_pre && sessao.peso_pos ? `${(sessao.peso_pre - sessao.peso_pos).toFixed(1)} kg` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UF Realizada:</span>
                  <span className="font-medium">{sessao["ultrafiltração_realizada"] ?? '—'} ml</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function calcularDuracao(inicio: string, fim: string) {
  const [hi, mi] = inicio.split(':').map(Number);
  const [hf, mf] = fim.split(':').map(Number);
  const d = (hf * 60 + mf) - (hi * 60 + mi);
  const h = Math.floor(d / 60);
  const m = d % 60;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}