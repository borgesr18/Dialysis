'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'medical';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    success,
    hint,
    variant = 'default',
    resize = 'vertical',
    disabled,
    ...props
  }, ref) => {
    const baseClasses = clsx(
      'w-full transition-all duration-300 ease-in-out',
      'border rounded-xl font-medium px-4 py-3 text-base',
      'focus:outline-none focus:ring-4',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both',
      }
    );
    
    const variantClasses = clsx({
      // Default variant
      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500/20': 
        variant === 'default' && !error && !success,
      
      // Medical variant
      'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-700 text-teal-900 dark:text-teal-100 focus:border-teal-500 focus:ring-teal-500/20':
        variant === 'medical' && !error && !success,
      
      // Error state
      'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:border-red-500 focus:ring-red-500/20':
        error,
      
      // Success state
      'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 focus:border-green-500 focus:ring-green-500/20':
        success,
    });
    
    return (
      <div className="space-y-2">
        {label && (
          <label className={clsx(
            'block text-sm font-semibold transition-colors duration-200',
            {
              'text-gray-700 dark:text-gray-300': !error && !success,
              'text-red-600 dark:text-red-400': error,
              'text-green-600 dark:text-green-400': success,
            }
          )}>
            {label}
          </label>
        )}
        
        <textarea
          className={clsx(baseClasses, variantClasses, className)}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {(error || success || hint) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hint}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
export type { TextareaProps };