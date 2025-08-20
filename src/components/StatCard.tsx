import { ReactNode } from 'react';
import { Card } from './ui/Card';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

export function StatCard({ title, value, change, icon, description, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-orange-500',
    yellow: 'from-yellow-500 to-orange-500'
  };

  const changeClasses = {
    increase: 'text-green-600 dark:text-green-400',
    decrease: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <Card variant="interactive" className="group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-200">
              {value}
            </span>
            {change && (
              <span className={clsx('text-sm font-medium flex items-center', changeClasses[change.type])}>
                {change.type === 'increase' && '↗'}
                {change.type === 'decrease' && '↘'}
                {change.type === 'neutral' && '→'}
                {change.value}
              </span>
            )}
          </div>
        </div>
        <div className={clsx(
          'p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-200',
          colorClasses[color]
        )}>
          <div className="text-white text-xl">{icon}</div>
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </Card>
  );
}