import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  hint?: string;
  variant?: 'default' | 'medical' | 'search' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    success,
    hint,
    variant = 'default',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    
    const baseClasses = clsx(
      'w-full transition-all duration-300 ease-in-out',
      'border rounded-xl font-medium',
      'focus:outline-none focus:ring-4',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        // Sizes
        'px-3 py-2 text-sm': size === 'sm',
        'px-4 py-3 text-base': size === 'md',
        'px-5 py-4 text-lg': size === 'lg',
        
        // Left icon padding
        'pl-10': leftIcon && size === 'sm',
        'pl-12': leftIcon && size === 'md',
        'pl-14': leftIcon && size === 'lg',
        
        // Right icon padding
        'pr-10': (rightIcon || isPassword) && size === 'sm',
        'pr-12': (rightIcon || isPassword) && size === 'md',
        'pr-14': (rightIcon || isPassword) && size === 'lg',
      }
    );
    
    const variantClasses = clsx({
      // Default variant
      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500/20': 
        variant === 'default' && !error && !success,
      
      // Medical variant
      'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-700 text-teal-900 dark:text-teal-100 focus:border-teal-500 focus:ring-teal-500/20':
        variant === 'medical' && !error && !success,
      
      // Search variant
      'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500/20':
        variant === 'search' && !error && !success,
      
      // Floating variant
      'bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 rounded-none border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0 focus:ring-offset-0':
        variant === 'floating' && !error && !success,
      
      // Error state
      'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:border-red-500 focus:ring-red-500/20':
        error,
      
      // Success state
      'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 focus:border-green-500 focus:ring-green-500/20':
        success,
    });
    
    const iconSize = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }[size];
    
    const iconPosition = {
      sm: { left: 'left-3', right: 'right-3' },
      md: { left: 'left-4', right: 'right-4' },
      lg: { left: 'left-5', right: 'right-5' }
    }[size];
    
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
        
        <div className="relative group">
          {leftIcon && (
            <div className={clsx(
              'absolute top-1/2 transform -translate-y-1/2 pointer-events-none transition-colors duration-200',
              iconPosition.left,
              {
                'text-gray-400 dark:text-gray-500': !error && !success && !isFocused,
                'text-primary-500': !error && !success && isFocused,
                'text-red-500': error,
                'text-green-500': success,
              }
            )}>
              <div className={iconSize}>
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={inputType}
            className={clsx(baseClasses, variantClasses, className)}
            ref={ref}
            disabled={disabled || loading}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {loading && (
            <div className={clsx(
              'absolute top-1/2 transform -translate-y-1/2',
              iconPosition.right
            )}>
              <div className={clsx('animate-spin', iconSize)}>
                <div className="w-full h-full border-2 border-gray-300 border-t-primary-500 rounded-full"></div>
              </div>
            </div>
          )}
          
          {!loading && isPassword && (
            <button
              type="button"
              className={clsx(
                'absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200',
                iconPosition.right
              )}
              onClick={() => setShowPassword(!showPassword)}
            >
              <div className={iconSize}>
                {showPassword ? <EyeOff /> : <Eye />}
              </div>
            </button>
          )}
          
          {!loading && !isPassword && rightIcon && (
            <div className={clsx(
              'absolute top-1/2 transform -translate-y-1/2 pointer-events-none',
              iconPosition.right,
              {
                'text-gray-400 dark:text-gray-500': !error && !success,
                'text-red-500': error,
                'text-green-500': success,
              }
            )}>
              <div className={iconSize}>
                {rightIcon}
              </div>
            </div>
          )}
          
          {!loading && !rightIcon && !isPassword && (error || success) && (
            <div className={clsx(
              'absolute top-1/2 transform -translate-y-1/2',
              iconPosition.right,
              {
                'text-red-500': error,
                'text-green-500': success,
              }
            )}>
              <div className={iconSize}>
                {error ? <AlertCircle /> : <CheckCircle2 />}
              </div>
            </div>
          )}
        </div>
        
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

Input.displayName = 'Input';

export { Input };
export type { InputProps };

