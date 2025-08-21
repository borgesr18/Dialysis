'use client';

import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, Check, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  variant?: 'default' | 'medical' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  label,
  error,
  success,
  hint,
  variant = 'default',
  size = 'md',
  searchable = false,
  disabled = false,
  loading = false,
  multiple = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (Array.isArray(value) ? value : value ? [value] : []) : []
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;
  
  const selectedOption = options.find(option => option.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);
  
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange?.(newValues.join(','));
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };
  
  const triggerClasses = clsx(
    'relative w-full cursor-pointer transition-all duration-300 ease-in-out',
    'border rounded-xl font-medium flex items-center justify-between',
    'focus:outline-none focus:ring-4',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    {
      // Sizes
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-3 text-base': size === 'md',
      'px-5 py-4 text-lg': size === 'lg',
    },
    {
      // Default variant
      'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500/20':
        variant === 'default' && !error && !success,
      
      // Medical variant
      'bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-700 text-teal-900 dark:text-teal-100 focus:border-teal-500 focus:ring-teal-500/20':
        variant === 'medical' && !error && !success,
      
      // Minimal variant
      'bg-transparent border-b-2 border-t-0 border-l-0 border-r-0 rounded-none border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-0':
        variant === 'minimal' && !error && !success,
      
      // Error state
      'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 focus:border-red-500 focus:ring-red-500/20':
        error,
      
      // Success state
      'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100 focus:border-green-500 focus:ring-green-500/20':
        success,
      
      // Open state
      'ring-4': isOpen,
      'ring-primary-500/20': isOpen && !error && !success,
      'ring-red-500/20': isOpen && error,
      'ring-green-500/20': isOpen && success,
    },
    className
  );
  
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
      
      <div ref={selectRef} className="relative">
        <div
          className={triggerClasses}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption?.icon && (
              <div className="flex-shrink-0">
                {selectedOption.icon}
              </div>
            )}
            <span className={clsx(
              'truncate',
              {
                'text-gray-500 dark:text-gray-400': !selectedOption,
              }
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {loading && (
              <div className="w-4 h-4 animate-spin">
                <div className="w-full h-full border-2 border-gray-300 border-t-primary-500 rounded-full"></div>
              </div>
            )}
            
            {(error || success) && !loading && (
              <div className={clsx(
                'w-4 h-4',
                {
                  'text-red-500': error,
                  'text-green-500': success,
                }
              )}>
                {error ? <AlertCircle /> : <CheckCircle2 />}
              </div>
            )}
            
            <ChevronDown className={clsx(
              'w-4 h-4 transition-transform duration-200',
              {
                'rotate-180': isOpen,
                'text-gray-400': !isOpen,
                'text-primary-500': isOpen,
              }
            )} />
          </div>
        </div>
        
        {isOpen && (
          <div className={clsx(
            'absolute z-50 w-full mt-2 bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            'max-h-60 overflow-auto'
          )}>
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
            
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  Nenhuma opção encontrada
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple
                    ? selectedValues.includes(option.value)
                    : value === option.value;
                  
                  return (
                    <div
                      key={option.value}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors duration-150',
                        {
                          'hover:bg-gray-50 dark:hover:bg-gray-700': !option.disabled && !isSelected,
                          'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300': isSelected,
                          'opacity-50 cursor-not-allowed': option.disabled,
                        }
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      {option.icon && (
                        <div className="flex-shrink-0">
                          {option.icon}
                        </div>
                      )}
                      
                      <span className="flex-1 truncate">
                        {option.label}
                      </span>
                      
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  );
                })
              )}
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
};

export { Select };
export type { Option };

