'use client';
import clsx from 'clsx';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { Loader2 } from 'lucide-react';
type Variant = 'primary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
export type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean; }>;
const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5' };
const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-700 hover:bg-gray-100',
};
export default function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }: ButtonProps) {
  return (
    <button {...props} className={clsx(base, sizes[size], variants[variant], className)} disabled={loading || props.disabled} aria-busy={loading ? 'true' : undefined}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{children}
    </button>
  );
}
