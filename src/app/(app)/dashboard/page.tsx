import { Suspense } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { 
  Users, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Heart,
  Droplets
} from 'lucide-react';
import { clsx } from 'clsx';

export const dynamic = 'force-dynamic';

// Componente de Loading para StatCards
function StatCardSkeleton() {
  return (
    <div className="animate-pulse">
      <Card className="h-32">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </Card>
    </div>
  );
}

// Componente de Estatísticas Principais
function MainStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total de Pacientes"
        value="248"
        change={{ value: "12%", type: "increase" }}
        icon={<Users className="w-6 h-6" />}
        description="Comparado ao mês passado"
        color="blue"
      />
      
      <StatCard
        title="Sessões Hoje"
        value="36"
        change={{ value: "8%", type: "increase" }}
        icon={<Calendar className="w-6 h-6" />}
        description="4 confirmações pendentes"
        color="green"
      />
      
      <StatCard
        title="Máquinas Disponíveis"
        value="18/24"
        change={{ value: "3", type: "decrease" }}
        icon={<Activity className="w-6 h-6" />}
        description="6 atualmente em uso"
        color="purple"
      />
      
      <StatCard
        title="Alertas Críticos"
        value="3"
        change={{ value: "2", type: "increase" }}
        icon={<AlertTriangle className="w-6 h-6" />}
        description="Requer atenção imediata"
        color="red"
      />
    </div>
  );
}

// Componente de Métricas Secundárias
function SecondaryMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        title="Taxa de Sucesso"
        value="98.5%"
        change={{ value: "0.3%", type: "increase" }}
        icon={<TrendingUp className="w-5 h-5" />}
        description="Últimos 30 dias"
        color="teal"
      />
      
      <StatCard
        title="Tempo Médio/Sessão"
        value="4.2h"
        change={{ value: "5min", type: "neutral" }}
        icon={<Clock className="w-5 h-5" />}
        description="Dentro do esperado"
        color="yellow"
      />
      
      <StatCard
        title="Satisfação Pacientes"
        value="4.8/5"
        change={{ value: "0.2", type: "increase" }}
        icon={<Heart className="w-5 h-5" />}
        description="Baseado em 156 avaliações"
        color="green"
      />
    </div>
  );
}

// Componente da Tabela de Sessões
function TodaysSessions() {
  const sessions = [
    {
      id: 1,
      patient: "Maria Silva",
      time: "08:00",
      machine: "HD-01",
      status: "Em Andamento",
      progress: 65,
      type: "Hemodiálise"
    },
    {
      id: 2,
      patient: "João Santos",
      time: "08:30",
      machine: "HD-03",
      status: "Concluída",
      progress: 100,
      type: "Hemodiálise"
    },
    {
      id: 3,
      patient: "Ana Costa",
      time: "09:00",
      machine: "HD-05",
      status: "Aguardando",
      progress: 0,
      type: "Diálise Peritoneal"
    },
    {
      id: 4,
      patient: "Carlos Lima",
      time: "09:30",
      machine: "HD-02",
      status: "Em Andamento",
      progress: 25,
      type: "Hemodiálise"
    },
    {
      id: 5,
      patient: "Lucia Ferreira",
      time: "10:00",
      machine: "HD-04",
      status: "Preparando",
      progress: 5,
      type: "Hemodiálise"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluída': return 'bg-medical-success-100 text-medical-success-800 dark:bg-medical-success-900/20 dark:text-medical-success-400';
      case 'Em Andamento': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Aguardando': return 'bg-medical-warning-100 text-medical-warning-800 dark:bg-medical-warning-900/20 dark:text-medical-warning-400';
      case 'Preparando': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-500" />
            Sessões de Hoje
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {sessions.length} sessões programadas
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 text-sm text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Filtrar
          </button>
          <button className="px-3 py-1.5 text-sm text-white bg-gradient-medical rounded-lg hover:shadow-glow transition-all duration-200">
            <Users className="w-4 h-4 mr-1" />
            Nova Sessão
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Horário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Máquina
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Progresso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {session.patient.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.patient}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                  {session.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {session.machine}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {session.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className={clsx(
                          'h-2 rounded-full transition-all duration-500',
                          session.progress === 100 ? 'bg-gradient-success' :
                          session.progress > 50 ? 'bg-gradient-medical' :
                          session.progress > 0 ? 'bg-gradient-warning' : 'bg-gray-300'
                        )}
                        style={{ width: `${session.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                      {session.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    getStatusColor(session.status)
                  )}>
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Componente de Alertas Rápidos
function QuickAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Manutenção Programada',
      message: 'Máquina HD-06 em manutenção às 14:00',
      time: '2h'
    },
    {
      id: 2,
      type: 'danger',
      title: 'Pressão Anormal',
      message: 'Paciente João - Verificar imediatamente',
      time: '5min'
    },
    {
      id: 3,
      type: 'success',
      title: 'Sessão Concluída',
      message: 'Maria Silva - Sessão finalizada com sucesso',
      time: '10min'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'danger': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <Heart className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-medical-warning-600 bg-medical-warning-50 dark:text-medical-warning-400 dark:bg-medical-warning-900/20';
      case 'danger': return 'text-medical-danger-600 bg-medical-danger-50 dark:text-medical-danger-400 dark:bg-medical-danger-900/20';
      case 'success': return 'text-medical-success-600 bg-medical-success-50 dark:text-medical-success-400 dark:bg-medical-success-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  return (
    <Card variant="medical" className="h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          Alertas Recentes
        </h3>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
          Ver todos
        </button>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-200">
            <div className={clsx('p-2 rounded-lg', getAlertColor(alert.type))}>
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {alert.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {alert.message}
              </p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {alert.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visão geral das operações da clínica
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
            Exportar Relatório
          </button>
          <button className="px-4 py-2 text-sm text-white bg-gradient-medical rounded-lg hover:shadow-glow transition-all duration-200">
            Atualizar Dados
          </button>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <MainStats />
      </Suspense>

      {/* Métricas Secundárias */}
      <Suspense fallback={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <SecondaryMetrics />
      </Suspense>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Sessões */}
        <div className="lg:col-span-2">
          <TodaysSessions />
        </div>
        
        {/* Alertas */}
        <div>
          <QuickAlerts />
        </div>
      </div>
    </div>
  );
}
