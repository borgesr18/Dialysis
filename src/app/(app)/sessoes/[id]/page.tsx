import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Save, Play, Square, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface SessaoPageProps {
  params: {
    id: string;
  };
}

export default function SessaoPage({ params }: SessaoPageProps) {
  // Mock data - será substituído por dados reais do Supabase
  const sessao = {
    id: params.id,
    paciente: { nome: 'João Silva', registro: '001' },
    maquina: { identificador: 'Máquina 01', sala: 'Sala A' },
    data_sessao: '2024-01-15',
    hora_inicio: '07:00',
    hora_fim: '11:00',
    status: 'EM_ANDAMENTO' as 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA',
    peso_pre: 70.5,
    peso_pos: 68.2,
    pressao_arterial_pre: '140/90',
    pressao_arterial_pos: '120/80',
    ultrafiltracao_prescrita: 2300,
    ultrafiltracao_realizada: 2300,
    observacoes: 'Paciente apresentou boa tolerância durante a sessão.'
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AGENDADA': { color: 'bg-blue-100 text-blue-800', label: 'Agendada' },
      'EM_ANDAMENTO': { color: 'bg-yellow-100 text-yellow-800', label: 'Em Andamento' },
      'CONCLUIDA': { color: 'bg-green-100 text-green-800', label: 'Concluída' },
      'CANCELADA': { color: 'bg-red-100 text-red-800', label: 'Cancelada' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
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
              Sessão #{sessao.id} - {sessao.paciente.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(sessao.data_sessao).toLocaleDateString('pt-BR')} às {sessao.hora_inicio}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(sessao.status)}
          {sessao.status === 'AGENDADA' && (
            <Button className="bg-green-600 hover:bg-green-700">
              <Play className="w-4 h-4 mr-2" />
              Iniciar Sessão
            </Button>
          )}
          {sessao.status === 'EM_ANDAMENTO' && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Finalizar Sessão
            </Button>
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
                    <p className="font-medium">{sessao.paciente.nome}</p>
                    <p className="text-sm text-gray-600">Registro: {sessao.paciente.registro}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Máquina</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{sessao.maquina.identificador}</p>
                    <p className="text-sm text-gray-600">{sessao.maquina.sala}</p>
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
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="peso_pre">Peso Pré (kg)</Label>
                    <Input
                      id="peso_pre"
                      type="number"
                      step="0.1"
                      defaultValue={sessao.peso_pre}
                      disabled={sessao.status === 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peso_pos">Peso Pós (kg)</Label>
                    <Input
                      id="peso_pos"
                      type="number"
                      step="0.1"
                      defaultValue={sessao.peso_pos}
                      disabled={sessao.status !== 'EM_ANDAMENTO' && sessao.status !== 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pressao_pre">Pressão Arterial Pré</Label>
                    <Input
                      id="pressao_pre"
                      defaultValue={sessao.pressao_arterial_pre}
                      disabled={sessao.status === 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pressao_pos">Pressão Arterial Pós</Label>
                    <Input
                      id="pressao_pos"
                      defaultValue={sessao.pressao_arterial_pos}
                      disabled={sessao.status !== 'EM_ANDAMENTO' && sessao.status !== 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uf_prescrita">Ultrafiltração Prescrita (ml)</Label>
                    <Input
                      id="uf_prescrita"
                      type="number"
                      defaultValue={sessao.ultrafiltracao_prescrita}
                      disabled={sessao.status === 'CONCLUIDA'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="uf_realizada">Ultrafiltração Realizada (ml)</Label>
                    <Input
                      id="uf_realizada"
                      type="number"
                      defaultValue={sessao.ultrafiltracao_realizada}
                      disabled={sessao.status !== 'EM_ANDAMENTO' && sessao.status !== 'CONCLUIDA'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    rows={4}
                    defaultValue={sessao.observacoes}
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
                  <span className="font-medium">4h 00min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Perda de Peso:</span>
                  <span className="font-medium text-green-600">2.3 kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">UF Realizada:</span>
                  <span className="font-medium">2300 ml</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Eficiência:</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico do Paciente</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Última Sessão:</p>
                  <p className="text-gray-600">12/01/2024</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Total de Sessões:</p>
                  <p className="text-gray-600">156 sessões</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Peso Seco:</p>
                  <p className="text-gray-600">68.0 kg</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}