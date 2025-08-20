import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'neutral' | 'warning' | 'danger' | 'default';
  children: React.ReactNode;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', children, className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full';
    
    const variantClasses = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };

