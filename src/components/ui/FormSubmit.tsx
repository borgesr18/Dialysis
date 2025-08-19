'use client';
import { useFormStatus } from 'react-dom';
import Button, { type ButtonProps } from './Button';
type Props = Omit<ButtonProps, 'loading' | 'type'> & { as?: 'button' };
export default function FormSubmit({ children, ...rest }: Props) { const { pending } = useFormStatus(); return (<Button type="submit" loading={pending} {...rest}>{children}</Button>); }
