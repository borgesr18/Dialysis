import { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { clsx } from 'clsx';

interface MedicalStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    border: 'border-blue-200',
  },
  success: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    border: 'border-green-200',
  },
  warning: {
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  danger: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    border: 'border-red-200',
  },
  info: {
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    border: 'border-purple-200',
  },
};

export function MedicalStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: MedicalStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={clsx(
      'p-6 hover:shadow-lg transition-all duration-300 border-l-4',
      styles.border,
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'p-3 rounded-lg',
              styles.iconBg
            )}>
              <Icon className={clsx('w-6 h-6', styles.iconColor)} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className="text-right">
            <div className={clsx(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              trend.isPositive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            )}>
              <span className={clsx(
                'mr-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↗' : '↘'}
              </span>
              {Math.abs(trend.value)}%
            </div>
            {trend.label && (
              <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}