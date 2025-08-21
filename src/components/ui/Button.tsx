'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, children, className, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';
    
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-soft hover:shadow-medium',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600 shadow-soft hover:shadow-medium',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 shadow-soft hover:shadow-medium',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-primary-500 dark:text-gray-300 dark:hover:bg-gray-800 hover:shadow-soft',
      danger: 'bg-medical-danger-600 text-white hover:bg-medical-danger-700 focus:ring-medical-danger-500 dark:bg-medical-danger-500 dark:hover:bg-medical-danger-600 shadow-danger hover:shadow-glow-danger',
      success: 'bg-medical-success-600 text-white hover:bg-medical-success-700 focus:ring-medical-success-500 dark:bg-medical-success-500 dark:hover:bg-medical-success-600 shadow-success hover:shadow-glow-success',
      warning: 'bg-medical-warning-600 text-white hover:bg-medical-warning-700 focus:ring-medical-warning-500 dark:bg-medical-warning-500 dark:hover:bg-medical-warning-600 shadow-warning hover:shadow-glow-warning',
      gradient: 'bg-gradient-medical text-white hover:shadow-glow focus:ring-primary-500 border-0'
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs rounded-md',
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect for gradient variant */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        )}
        
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };

