'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Loader2, Heart, Activity } from 'lucide-react';

// Skeleton Component
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'medical';
  animation?: 'pulse' | 'wave' | 'shimmer';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  animation = 'shimmer'
}) => {
  const baseClasses = clsx(
    'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
    {
      'animate-pulse': animation === 'pulse',
      'animate-shimmer bg-[length:200%_100%]': animation === 'shimmer',
      'animate-wave': animation === 'wave',
      
      'h-4 rounded': variant === 'text',
      'rounded-full aspect-square': variant === 'circular',
      'rounded-lg': variant === 'rectangular',
      'rounded-xl bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-200 dark:from-teal-800 dark:via-emerald-800 dark:to-teal-800': variant === 'medical',
    },
    className
  );
  
  return <div className={baseClasses} />;
};

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'medical' | 'dots' | 'pulse';
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }[size];
  
  if (variant === 'medical') {
    return (
      <div className={clsx('relative', sizeClasses, className)}>
        <div className="absolute inset-0 animate-spin">
          <div className="w-full h-full border-4 border-teal-200 dark:border-teal-800 rounded-full"></div>
          <div className="absolute inset-0 w-full h-full border-4 border-transparent border-t-teal-500 rounded-full animate-spin"></div>
        </div>
        <Heart className="absolute inset-0 m-auto w-1/2 h-1/2 text-teal-500 animate-pulse" />
      </div>
    );
  }
  
  if (variant === 'dots') {
    return (
      <div className={clsx('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              'bg-primary-500 rounded-full animate-bounce',
              {
                'w-2 h-2': size === 'sm',
                'w-3 h-3': size === 'md',
                'w-4 h-4': size === 'lg',
                'w-6 h-6': size === 'xl',
              }
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    );
  }
  
  if (variant === 'pulse') {
    return (
      <div className={clsx('relative', sizeClasses, className)}>
        <Activity className="w-full h-full text-primary-500 animate-pulse" />
        <div className="absolute inset-0 bg-primary-500/20 rounded-full animate-ping"></div>
      </div>
    );
  }
  
  return (
    <Loader2 className={clsx(
      'animate-spin text-primary-500',
      sizeClasses,
      className
    )} />
  );
};

// Loading Overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  variant?: 'default' | 'medical' | 'minimal';
  blur?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  message = 'Carregando...',
  variant = 'default',
  blur = true
}) => {
  return (
    <div className="relative">
      <div className={clsx(
        'transition-all duration-300',
        {
          'filter blur-sm opacity-50': isLoading && blur,
          'opacity-100': !isLoading
        }
      )}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <Spinner
              size="lg"
              variant={variant === 'medical' ? 'medical' : 'default'}
            />
            {message && (
              <p className={clsx(
                'text-sm font-medium',
                {
                  'text-gray-600 dark:text-gray-400': variant === 'default',
                  'text-teal-600 dark:text-teal-400': variant === 'medical',
                  'text-gray-500': variant === 'minimal'
                }
              )}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Progress Bar
interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'medical' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  animated = true,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }[size];
  
  const variantClasses = {
    default: 'bg-primary-500',
    medical: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }[variant];
  
  return (
    <div className={clsx('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
          <span>Progresso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={clsx(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        heightClasses
      )}>
        <div
          className={clsx(
            'h-full transition-all duration-500 ease-out rounded-full',
            variantClasses,
            {
              'animate-pulse': animated && percentage > 0,
            }
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="h-full w-full bg-white/20 animate-shimmer bg-[length:200%_100%]"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Skeleton, Spinner, LoadingOverlay, Progress };