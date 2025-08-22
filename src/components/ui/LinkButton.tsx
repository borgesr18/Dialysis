'use client';

import Link from 'next/link';
import { AnchorHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface LinkButtonProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
}

const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    className, 
    href, 
    prefetch = true,
    replace = false,
    scroll = true,
    shallow = false,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group no-underline';
    
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

    // Determinar se deve fazer prefetch baseado no tipo de link
    const shouldPrefetch = prefetch && (
      href.startsWith('/') && // Links internos
      !href.includes('?') && // Sem query parameters complexos
      !href.includes('#') && // Sem anchors
      !href.includes('/api/') // Não é rota de API
    );

    return (
      <Link
        ref={ref}
        href={href}
        prefetch={shouldPrefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        className={clsx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Shimmer effect for gradient variant */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-shimmer bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        )}
        
        <span className="relative z-10">{children}</span>
      </Link>
    );
  }
);

LinkButton.displayName = 'LinkButton';

export { LinkButton };
export type { LinkButtonProps };

