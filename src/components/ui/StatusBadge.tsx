'use client';

import { clsx } from 'clsx';
import { LucideIcon, Clock, Play, Pause, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type StatusType = 
  | 'agendada'
  | 'em_andamento'
  | 'pausada'
  | 'concluida'
  | 'cancelada'
  | 'atrasada'
  | 'ativo'
  | 'inativo'
  | 'manutencao'
  | 'disponivel'
  | 'ocupada';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<StatusType, {
  label: string;
  icon: LucideIcon;
  colors: {
    bg: string;
    text: string;
    border: string;
  };
}> = {
  agendada: {
    label: 'Agendada',
    icon: Clock,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
  },
  em_andamento: {
    label: 'Em Andamento',
    icon: Play,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
  },
  pausada: {
    label: 'Pausada',
    icon: Pause,
    colors: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
  },
  concluida: {
    label: 'Concluída',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
  },
  atrasada: {
    label: 'Atrasada',
    icon: AlertCircle,
    colors: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
  },
  ativo: {
    label: 'Ativo',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
  },
  inativo: {
    label: 'Inativo',
    icon: XCircle,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
  },
  manutencao: {
    label: 'Manutenção',
    icon: AlertCircle,
    colors: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
  },
  disponivel: {
    label: 'Disponível',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
  },
  ocupada: {
    label: 'Ocupada',
    icon: Clock,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-1',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
};

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  if (!config) {
    console.warn(`Status "${status}" não encontrado na configuração`);
    return null;
  }

  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full border',
      config.colors.bg,
      config.colors.text,
      config.colors.border,
      sizeStyles.padding,
      sizeStyles.text,
      className
    )}>
      {showIcon && (
        <Icon className={clsx(
          sizeStyles.icon,
          size !== 'sm' && 'mr-1.5'
        )} />
      )}
      {size !== 'sm' && config.label}
    </span>
  );
}

// Componente para indicador de status com ponto colorido
interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  size = 'md',
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return null;
  }

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={clsx('flex items-center', className)}>
      <div className={clsx(
        'rounded-full mr-2',
        config.colors.bg.replace('bg-', 'bg-').replace('-100', '-500'),
        dotSizes[size]
      )} />
      <span className={clsx(
        'font-medium text-gray-900',
        textSizes[size]
      )}>
        {label || config.label}
      </span>
    </div>
  );
}