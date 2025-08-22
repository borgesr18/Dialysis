export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/LoadingStates';
import { ArrowLeft, Download, Filter, Activity, TrendingUp, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function RelatoriosClinicoPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Relatório Clínico</h1>
            <p className="text-gray-600 mt-1">Análise de indicadores clínicos e qualidade do tratamento</p>
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
              <Label htmlFor="periodo">Período</Label>
              <Select 
                placeholder="Selecionar período"
                options={[
                  { value: '30', label: 'Últimos 30 dias' },
                  { value: '90', label: 'Últimos 3 meses' },
                  { value: '180', label: 'Últimos 6 meses' },
                  { value: '365', label: 'Último ano' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paciente">Paciente</Label>
              <Select 
                placeholder="Todos os pacientes"
                options={[
                  { value: '', label: 'Todos os pacientes' },
                  { value: '1', label: 'João Silva' },
                  { value: '2', label: 'Maria Santos' },
                  { value: '3', label: 'Pedro Oliveira' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="indicador">Indicador</Label>
              <Select 
                placeholder="Todos os indicadores"
                options={[
                  { value: '', label: 'Todos os indicadores' },
                  { value: 'kt_v', label: 'Kt/V' },
                  { value: 'urr', label: 'URR' },
                  { value: 'ganho_peso', label: 'Ganho de Peso' },
                  { value: 'pressao', label: 'Pressão Arterial' }
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

      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kt/V Médio</p>
              <p className="text-2xl font-bold text-gray-900">1.42</p>
              <p className="text-xs text-green-600">Meta: &gt;1.2</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">URR Médio</p>
              <p className="text-2xl font-bold text-gray-900">68.5%</p>
              <p className="text-xs text-green-600">Meta: &gt;65%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ganho Peso Médio</p>
              <p className="text-2xl font-bold text-gray-900">2.8kg</p>
              <p className="text-xs text-yellow-600">Meta: &lt;3kg</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Adequação</p>
              <p className="text-2xl font-bold text-gray-900">89.2%</p>
              <p className="text-xs text-green-600">Pacientes na meta</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos de Tendência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Kt/V</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Gráfico de evolução do Kt/V</p>
                <p className="text-sm">Implementar com biblioteca de gráficos</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição URR</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">&lt; 65% (Inadequado)</span>
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-200 rounded mr-3">
                    <div className="w-2/12 h-3 bg-red-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">8.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">65-70% (Adequado)</span>
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-200 rounded mr-3">
                    <div className="w-6/12 h-3 bg-yellow-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45.2%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">&gt; 70% (Ótimo)</span>
                <div className="flex items-center">
                  <div className="w-32 h-3 bg-gray-200 rounded mr-3">
                    <div className="w-9/12 h-3 bg-green-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">46.3%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Alertas Clínicos */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas Clínicos</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">João Silva - Kt/V abaixo da meta</p>
                <p className="text-xs text-red-600">Kt/V: 1.05 (Meta: &gt;1.2) - Última sessão: 15/01/2024</p>
              </div>
              <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                Ver Detalhes
              </Button>
            </div>
            <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">Maria Santos - Ganho de peso excessivo</p>
                <p className="text-xs text-yellow-600">Ganho: 3.8kg (Meta: &lt;3kg) - Última sessão: 15/01/2024</p>
              </div>
              <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-300">
                Ver Detalhes
              </Button>
            </div>
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">Pedro Oliveira - Pressão arterial elevada</p>
                <p className="text-xs text-orange-600">PA: 180/100 mmHg - Última sessão: 14/01/2024</p>
              </div>
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela de Indicadores por Paciente */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Indicadores por Paciente</h2>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kt/V Médio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URR Médio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ganho Peso Médio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PA Média
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Mock data - será substituído por dados reais */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      João Silva
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1.05
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      62.3%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      2.1kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      140/85
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Atenção
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Maria Santos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1.48
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      71.2%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      3.8kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      135/80
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Monitorar
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pedro Oliveira
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1.52
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      73.8%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      2.3kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      180/100
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        Hipertensão
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ana Costa
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1.38
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      69.5%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      2.5kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      125/75
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Adequado
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Suspense>
        </div>
      </Card>
    </div>
  );
}