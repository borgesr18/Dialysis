import { ReactNode } from 'react';
import { Card } from './Card';
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
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'teal';
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  description, 
  color = 'blue',
  loading = false 
}: StatCardProps) {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400'
    },
    red: {
      gradient: 'from-red-500 to-orange-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400'
    },
    teal: {
      gradient: 'from-teal-500 to-cyan-500',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      text: 'text-teal-600 dark:text-teal-400'
    }
  };

  const changeClasses = {
    increase: 'text-medical-success-600 dark:text-medical-success-400',
    decrease: 'text-medical-danger-600 dark:text-medical-danger-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  const changeIcons = {
    increase: '↗',
    decrease: '↘',
    neutral: '→'
  };

  if (loading) {
    return (
      <Card variant="interactive" className="group animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-24"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </Card>
    );
  }

  return (
    <Card variant="interactive" className="group overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={clsx('w-full h-full bg-gradient-to-br', colorClasses[color].gradient)}></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 group-hover:scale-105 transition-transform duration-200">
                {value}
              </span>
              {change && (
                <span className={clsx(
                  'text-sm font-medium flex items-center space-x-1 px-2 py-1 rounded-full',
                  changeClasses[change.type],
                  colorClasses[color].bg
                )}>
                  <span className="text-xs">{changeIcons[change.type]}</span>
                  <span>{change.value}</span>
                </span>
              )}
            </div>
          </div>
          
          {/* Icon Container */}
          <div className={clsx(
            'p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300',
            colorClasses[color].gradient,
            'animate-float'
          )}>
            <div className="text-white text-xl">{icon}</div>
          </div>
        </div>
        
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
            {description}
          </p>
        )}
      </div>
      
      {/* Hover Glow Effect */}
      <div className={clsx(
        'absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl',
        'bg-gradient-to-br',
        colorClasses[color].gradient
      )}></div>
    </Card>
  );
}