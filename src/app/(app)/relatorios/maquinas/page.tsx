export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/LoadingStates';
import { ArrowLeft, Download, Filter, Monitor, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function RelatoriosMaquinasPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/relatorios">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Máquinas</h1>
            <p className="text-gray-600 mt-1">Análise de desempenho e utilização das máquinas</p>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Filter className="w-5 h-5 mr-2 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maquina">Máquina</Label>
              <Select 
                placeholder="Todas as máquinas"
                options={[
                  { value: '', label: 'Todas as máquinas' },
                  { value: '1', label: 'Máquina 01' },
                  { value: '2', label: 'Máquina 02' },
                  { value: '3', label: 'Máquina 03' },
                  { value: '4', label: 'Máquina 04' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                placeholder="Todos os status"
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'ATIVA', label: 'Ativa' },
                  { value: 'MANUTENCAO', label: 'Manutenção' },
                  { value: 'INATIVA', label: 'Inativa' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo">Período</Label>
              <Select 
                placeholder="Selecionar período"
                options={[
                  { value: '', label: 'Selecionar período' },
                  { value: '7', label: 'Últimos 7 dias' },
                  { value: '30', label: 'Últimos 30 dias' },
                  { value: '90', label: 'Últimos 90 dias' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turno">Turno</Label>
              <Select 
                placeholder="Todos os turnos"
                options={[
                  { value: '', label: 'Todos os turnos' },
                  { value: 'MANHA', label: 'Manhã' },
                  { value: 'TARDE', label: 'Tarde' },
                  { value: 'NOITE', label: 'Noite' }
                ]}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Máquinas</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Máquinas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">10</p>
              <p className="text-xs text-green-600">83.3%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Manutenção</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Utilização</p>
              <p className="text-2xl font-bold text-gray-900">87.5%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos de Utilização */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Utilização por Turno</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Manhã (06:00 - 12:00)</span>
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-200 rounded mr-3">
                    <div className="w-11/12 h-3 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tarde (12:00 - 18:00)</span>
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-200 rounded mr-3">
                    <div className="w-10/12 h-3 bg-green-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Noite (18:00 - 00:00)</span>
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-200 rounded mr-3">
                    <div className="w-9/12 h-3 bg-yellow-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">75%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status das Máquinas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Ativas</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">10 máquinas</span>
                  <span className="text-xs text-gray-500 block">83.3%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Manutenção</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">2 máquinas</span>
                  <span className="text-xs text-gray-500 block">16.7%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Inativas</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">0 máquinas</span>
                  <span className="text-xs text-gray-500 block">0%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Máquinas */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes das Máquinas</h2>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Máquina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sala
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas de Uso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Manutenção
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilização
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Mock data - será substituído por dados reais */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Máquina 01
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Fresenius 5008S
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Sala A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1,245h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      10/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Ativa
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      95%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Máquina 02
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Fresenius 5008S
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Sala A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1,156h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      08/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Ativa
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      88%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Máquina 03
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Nipro Surdial X
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Sala B
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      987h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      15/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Manutenção
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      0%
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Máquina 04
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      B.Braun Dialog+
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Sala B
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1,398h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      05/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Ativa
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      92%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Suspense>
        </div>
      </Card>

      {/* Alertas de Manutenção */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Manutenção</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Máquina 05 - Manutenção Preventiva</p>
                <p className="text-xs text-yellow-600">Agendada para 20/01/2024</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Máquina 08 - Manutenção Urgente</p>
                <p className="text-xs text-red-600">Problema no sistema de ultrafiltração</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}