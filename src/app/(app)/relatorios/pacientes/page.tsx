export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/LoadingStates';
import { ArrowLeft, Download, Filter, Users, Activity, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function RelatoriosPacientesPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Pacientes</h1>
            <p className="text-gray-600 mt-1">Análise detalhada dos pacientes em tratamento</p>
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
              <Label htmlFor="nome">Nome do Paciente</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Digite o nome..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status_tratamento">Status do Tratamento</Label>
              <Select 
                placeholder="Todos os status"
                options={[
                  { value: '', label: 'Todos os status' },
                  { value: 'ATIVO', label: 'Ativo' },
                  { value: 'INATIVO', label: 'Inativo' },
                  { value: 'SUSPENSO', label: 'Suspenso' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_acesso">Tipo de Acesso</Label>
              <Select 
                placeholder="Todos os tipos"
                options={[
                  { value: '', label: 'Todos os tipos' },
                  { value: 'FAV', label: 'FAV' },
                  { value: 'CDL', label: 'Cateter' },
                  { value: 'PROTESE', label: 'Prótese' }
                ]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo">Período de Cadastro</Label>
              <Select 
                placeholder="Todos os períodos"
                options={[
                  { value: '', label: 'Todos os períodos' },
                  { value: '30', label: 'Últimos 30 dias' },
                  { value: '90', label: 'Últimos 3 meses' },
                  { value: '365', label: 'Último ano' }
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
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">127</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">118</p>
              <p className="text-xs text-green-600">92.9%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Novos este Mês</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">2.3 anos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Distribuição por Tipo de Acesso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Tipo de Acesso</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">FAV (Fístula)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">78 pacientes</span>
                  <span className="text-xs text-gray-500 block">61.4%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Cateter</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">35 pacientes</span>
                  <span className="text-xs text-gray-500 block">27.6%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                  <span className="text-sm text-gray-600">Prótese</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">14 pacientes</span>
                  <span className="text-xs text-gray-500 block">11.0%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Faixa Etária</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">18-30 anos</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div className="w-2/12 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">31-50 anos</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div className="w-6/12 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">38</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">51-70 anos</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div className="w-8/12 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">52</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">70+ anos</span>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                    <div className="w-5/12 h-2 bg-blue-500 rounded"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">25</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Pacientes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lista de Pacientes</h2>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo de Acesso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Sessão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Sessões
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
                      45 anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      FAV
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      15/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      156
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Maria Santos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      62 anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Cateter
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      15/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      89
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Pedro Oliveira
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      38 anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      FAV
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      14/01/2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      203
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Suspenso
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