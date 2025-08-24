'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Checkbox({
  id,
  checked = false,
  onChange,
  disabled = false,
  label,
  className = ''
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleChange}
        className={`
          w-4 h-4 border-2 rounded flex items-center justify-center
          transition-colors duration-200
          ${checked 
            ? 'bg-blue-600 border-blue-600 text-white' 
            : 'bg-white border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `}
      >
        {checked && (
          <Check className="w-3 h-3" />
        )}
      </button>
      {label && (
        <label 
          htmlFor={id}
          className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700 cursor-pointer'}`}
          onClick={handleChange}
        >
          {label}
        </label>
      )}
    </div>
  );
}