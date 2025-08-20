import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/LoadingStates';
import { ArrowLeft, Download, Filter, Calendar, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function RelatorioSessoesPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Sessões</h1>
            <p className="text-gray-600 mt-1">Análise detalhada das sessões de hemodiálise</p>
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
              <Label htmlFor="data_inicio">Data Início</Label>
              <Input
                id="data_inicio"
                type="date"
                defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_fim">Data Fim</Label>
              <Input
                id="data_fim"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
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
              <Label htmlFor="status">Status</Label>
              <Select 
                placeholder="Todos os status"
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'CONCLUIDA', label: 'Concluída' },
                  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
                  { value: 'AGENDADA', label: 'Agendada' },
                  { value: 'CANCELADA', label: 'Cancelada' }
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
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Concluídas</p>
              <p className="text-2xl font-bold text-gray-900">298</p>
              <p className="text-xs text-green-600">87.1%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">4h 15min</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">UF Média</p>
              <p className="text-2xl font-bold text-gray-900">2.1L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Sessões por Dia */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessões por Dia</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Gráfico de sessões por dia</p>
              <p className="text-sm">Implementar com biblioteca de gráficos</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela de Sessões */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes das Sessões</h2>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Máquina
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UF (ml)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Mock data - será substituído por dados reais */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      15/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      João Silva
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Máquina 01
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      4h 00min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      2300
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Concluída
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      15/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Maria Santos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Máquina 02
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      4h 30min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      2100
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Concluída
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      15/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Pedro Oliveira
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Máquina 03
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      3h 45min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      1800
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Em Andamento
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