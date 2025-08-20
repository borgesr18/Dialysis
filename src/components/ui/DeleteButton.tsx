'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './Button';

interface DeleteButtonProps {
  children: React.ReactNode;
  confirmMessage?: string;
  variant?: 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DeleteButton({ 
  children, 
  confirmMessage = 'Tem certeza que deseja excluir?',
  variant = 'ghost',
  size = 'sm',
  className = ''
}: DeleteButtonProps) {
  const { pending } = useFormStatus();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!isConfirmed) {
      e.preventDefault();
      if (confirm(confirmMessage)) {
        setIsConfirmed(true);
        // Trigger form submission after confirmation
        setTimeout(() => {
          const form = (e.target as HTMLElement).closest('form');
          if (form) {
            form.requestSubmit();
          }
        }, 0);
      }
    }
  };

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      loading={pending}
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}