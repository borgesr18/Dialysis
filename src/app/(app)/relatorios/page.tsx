export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/LoadingStates';
import { FileText, BarChart3, Calendar, Users, Download, Filter } from 'lucide-react';
import Link from 'next/link';

export default function RelatoriosPage() {
  const relatorios = [
    {
      id: 'sessoes',
      titulo: 'Relatório de Sessões',
      descricao: 'Relatório detalhado das sessões de hemodiálise realizadas',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      href: '/relatorios/sessoes'
    },
    {
      id: 'pacientes',
      titulo: 'Relatório de Pacientes',
      descricao: 'Estatísticas e dados dos pacientes cadastrados',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      href: '/relatorios/pacientes'
    },
    {
      id: 'maquinas',
      titulo: 'Relatório de Máquinas',
      descricao: 'Utilização e manutenção das máquinas de hemodiálise',
      icon: BarChart3,
      color: 'bg-purple-100 text-purple-600',
      href: '/relatorios/maquinas'
    },
    {
      id: 'clinico',
      titulo: 'Relatório Clínico',
      descricao: 'Dados clínicos e evolução dos pacientes',
      icon: FileText,
      color: 'bg-orange-100 text-orange-600',
      href: '/relatorios/clinico'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Gere relatórios detalhados sobre as atividades da clínica</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sessões Este Mês</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Relatórios Gerados</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tipos de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {relatorios.map((relatorio) => {
          const IconComponent = relatorio.icon;
          return (
            <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${relatorio.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {relatorio.titulo}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {relatorio.descricao}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Link href={relatorio.href}>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Relatórios Recentes */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Recentes</h2>
          <Suspense fallback={<div className="space-y-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}>
            <div className="space-y-4">
              {/* Placeholder para lista de relatórios recentes */}
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum relatório gerado recentemente</p>
                <p className="text-sm">Os relatórios gerados aparecerão aqui</p>
              </div>
            </div>
          </Suspense>
        </div>
      </Card>
    </div>
  );
}