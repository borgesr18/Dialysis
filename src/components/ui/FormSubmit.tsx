'use client';

import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from './Button';

interface FormSubmitProps extends Omit<ButtonProps, 'loading' | 'type'> {
  children: React.ReactNode;
}

export function FormSubmit({ children, ...props }: FormSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}

