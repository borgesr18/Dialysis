'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import {
  Activity,
  Users,
  Zap,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { Card } from './Card';
import { StatusBadge } from './StatusBadge';
import { MedicalStatCard } from './MedicalStatCard';
import { MedicalAlert, MedicalAlertList } from './MedicalAlert';

interface DashboardData {
  sessoes: {
    total: number;
    ativas: number;
    concluidas: number;
    canceladas: number;
  };
  maquinas: {
    total: number;
    ativas: number;
    manutencao: number;
    disponiveis: number;
  };
  pacientes: {
    total: number;
    ativos: number;
    agendados: number;
  };
  atividades: Array<{
    id: string;
    tipo: string;
    descricao: string;
    timestamp: string;
    usuario: string;
  }>;
  alertas: Array<{
    id: string;
    tipo: 'success' | 'warning' | 'error' | 'info';
    titulo: string;
    mensagem: string;
    timestamp: string;
    acao?: {
      label: string;
      onClick: () => void;
    };
  }>;
}

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

interface SessionSummary {
  total: number;
  completed: number;
  inProgress: number;
  scheduled: number;
  cancelled: number;
}

interface MachineSummary {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  inactive: number;
}

interface PatientSummary {
  total: number;
  active: number;
  newThisMonth: number;
  averageAge: number;
}

interface RecentActivity {
  id: string;
  type: 'session_started' | 'session_completed' | 'patient_registered' | 'machine_maintenance' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface MedicalDashboardProps {
  sessionSummary: SessionSummary;
  machineSummary: MachineSummary;
  patientSummary: PatientSummary;
  recentActivities: RecentActivity[];
  alerts: Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }>;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

export function MedicalDashboard({
  sessionSummary,
  machineSummary,
  patientSummary,
  recentActivities = [],
  alerts = [],
  loading = false,
  onRefresh,
  className,
}: MedicalDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  // Calculate metrics
  const sessionMetrics: DashboardMetric[] = [
    {
      id: 'total-sessions',
      title: 'Sessões Hoje',
      value: sessionSummary.total,
      subtitle: `${sessionSummary.completed} concluídas`,
      icon: <Activity className="w-6 h-6" />,
      trend: {
        value: 12,
        isPositive: true,
        period: 'vs. ontem',
      },
      variant: 'info',
    },
    {
      id: 'active-patients',
      title: 'Pacientes Ativos',
      value: patientSummary.active,
      subtitle: `${patientSummary.newThisMonth} novos este mês`,
      icon: <Users className="w-6 h-6" />,
      trend: {
        value: 5,
        isPositive: true,
        period: 'este mês',
      },
      variant: 'success',
    },
    {
      id: 'available-machines',
      title: 'Máquinas Disponíveis',
      value: machineSummary.available,
      subtitle: `${machineSummary.total} total`,
      icon: <Zap className="w-6 h-6" />,
      trend: {
        value: machineSummary.maintenance,
        isPositive: false,
        period: 'em manutenção',
      },
      variant: machineSummary.maintenance > 2 ? 'warning' : 'default',
    },
    {
      id: 'sessions-in-progress',
      title: 'Em Andamento',
      value: sessionSummary.inProgress,
      subtitle: 'sessões ativas',
      icon: <Clock className="w-6 h-6" />,
      variant: 'info',
    },
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'session_started':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'session_completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'patient_registered':
        return <Users className="w-4 h-4 text-purple-600" />;
      case 'machine_maintenance':
        return <Zap className="w-4 h-4 text-orange-600" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de hemodiálise</p>
        </div>
        
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={clsx(
              'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
            )}
          >
            <div className={clsx('w-4 h-4', refreshing && 'animate-spin')}>
              <Activity className="w-4 h-4" />
            </div>
            <span>{refreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <MedicalAlertList alerts={alerts} />
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MedicalStatCard
              title="Sessões Ativas"
              value={sessionSummary.inProgress.toString()}
              subtitle={`${sessionSummary.total} total hoje`}
              icon={Activity}
              variant="info"
              trend={{ value: 12, isPositive: true }}
            />
            <MedicalStatCard
              title="Máquinas Disponíveis"
              value={machineSummary.available.toString()}
              subtitle={`${machineSummary.total} total`}
              icon={Zap}
              variant="success"
              trend={{ value: 2, isPositive: true }}
            />
            <MedicalStatCard
              title="Pacientes Ativos"
              value={patientSummary.active.toString()}
              subtitle={`${patientSummary.newThisMonth} novos este mês`}
              icon={Users}
              variant="default"
              trend={{ value: 5, isPositive: false }}
            />
            <MedicalStatCard
              title="Manutenções Pendentes"
              value={machineSummary.maintenance.toString()}
              subtitle="Requer atenção"
              icon={AlertTriangle}
              variant="warning"
              trend={{ value: 1, isPositive: false }}
            />
      </div>

      {/* Detailed Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status das Sessões</h3>
            <Activity className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="em_andamento" size="sm" />
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <span className="font-semibold">{sessionSummary.inProgress}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="agendada" size="sm" />
                <span className="text-sm text-gray-600">Agendadas</span>
              </div>
              <span className="font-semibold">{sessionSummary.scheduled}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="concluida" size="sm" />
                <span className="text-sm text-gray-600">Concluídas</span>
              </div>
              <span className="font-semibold">{sessionSummary.completed}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="cancelada" size="sm" />
                <span className="text-sm text-gray-600">Canceladas</span>
              </div>
              <span className="font-semibold">{sessionSummary.cancelled}</span>
            </div>
          </div>
        </Card>

        {/* Machines Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status das Máquinas</h3>
            <Zap className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="disponivel" size="sm" />
                <span className="text-sm text-gray-600">Disponíveis</span>
              </div>
              <span className="font-semibold">{machineSummary.available}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="ocupada" size="sm" />
                <span className="text-sm text-gray-600">Ocupadas</span>
              </div>
              <span className="font-semibold">{machineSummary.occupied}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="manutencao" size="sm" />
                <span className="text-sm text-gray-600">Manutenção</span>
              </div>
              <span className="font-semibold">{machineSummary.maintenance}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StatusBadge status="inativo" size="sm" />
                <span className="text-sm text-gray-600">Inativas</span>
              </div>
              <span className="font-semibold">{machineSummary.inactive}</span>
            </div>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma atividade recente
              </p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isClient ? formatTimeAgo(activity.timestamp) : 'Carregando...'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {((sessionSummary.completed / sessionSummary.total) * 100 || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Taxa de Conclusão</div>
          <div className="text-xs text-gray-500 mt-1">Sessões de hoje</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {patientSummary.averageAge}
          </div>
          <div className="text-sm text-gray-600">Idade Média</div>
          <div className="text-xs text-gray-500 mt-1">Pacientes ativos</div>
        </Card>
        
        <Card className="p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {((machineSummary.available / machineSummary.total) * 100 || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Disponibilidade</div>
          <div className="text-xs text-gray-500 mt-1">Máquinas operacionais</div>
        </Card>
      </div>
    </div>
  );
}

// Hook para dados mock do dashboard
export function useMockDashboardData() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const sessionSummary: SessionSummary = {
    total: 24,
    completed: 18,
    inProgress: 4,
    scheduled: 2,
    cancelled: 0,
  };

  const machineSummary: MachineSummary = {
    total: 12,
    available: 8,
    occupied: 4,
    maintenance: 0,
    inactive: 0,
  };

  const patientSummary: PatientSummary = {
    total: 156,
    active: 142,
    newThisMonth: 8,
    averageAge: 58,
  };

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'session_completed',
      title: 'Sessão concluída',
      description: 'João Silva - Máquina 03',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: '2',
      type: 'session_started',
      title: 'Sessão iniciada',
      description: 'Maria Santos - Máquina 01',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '3',
      type: 'patient_registered',
      title: 'Novo paciente',
      description: 'Pedro Oliveira cadastrado',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  ];

  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Manutenção Programada',
      message: 'Máquina 05 tem manutenção agendada para amanhã às 08:00',
    },
  ];

  return {
    sessionSummary,
    machineSummary,
    patientSummary,
    recentActivities,
    alerts,
    loading,
  };
}