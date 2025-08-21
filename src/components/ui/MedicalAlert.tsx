'use client';

import { LucideIcon, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface MedicalAlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    buttonColor: 'text-green-600 border-green-300 hover:bg-green-100',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    buttonColor: 'text-yellow-600 border-yellow-300 hover:bg-yellow-100',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    buttonColor: 'text-red-600 border-red-300 hover:bg-red-100',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    buttonColor: 'text-blue-600 border-blue-300 hover:bg-blue-100',
  },
};

export function MedicalAlert({
  type,
  title,
  message,
  action,
  onDismiss,
  className,
}: MedicalAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={clsx(
      'flex items-start p-4 border rounded-lg',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex-shrink-0">
        <Icon className={clsx('w-5 h-5', config.iconColor)} />
      </div>
      
      <div className="ml-3 flex-1">
        <h3 className={clsx('text-sm font-medium', config.titleColor)}>
          {title}
        </h3>
        <p className={clsx('mt-1 text-sm', config.messageColor)}>
          {message}
        </p>
        
        {action && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
              className={config.buttonColor}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
      
      {onDismiss && (
        <div className="ml-auto pl-3">
          <Button
            onClick={onDismiss}
            className={clsx(
              'inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2',
              config.iconColor
            )}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente para lista de alertas
interface MedicalAlertListProps {
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
  onDismiss?: (id: string) => void;
  className?: string;
}

export function MedicalAlertList({
  alerts,
  onDismiss,
  className,
}: MedicalAlertListProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={clsx('space-y-3', className)}>
      {alerts.map((alert) => (
        <MedicalAlert
          key={alert.id}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          action={alert.action}
          onDismiss={onDismiss ? () => onDismiss(alert.id) : undefined}
        />
      ))}
    </div>
  );
}