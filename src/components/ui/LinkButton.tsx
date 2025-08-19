import Link from 'next/link';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
type Variant = 'primary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';
export type LinkButtonProps = PropsWithChildren<{ href: string; className?: string; variant?: Variant; size?: Size; prefetch?: boolean }>;
const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors';
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5' };
const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-700 hover:bg-gray-100',
};
export default function LinkButton({ href, className, children, variant = 'primary', size = 'md', prefetch = true }: LinkButtonProps) {
  return <Link prefetch={prefetch} href={href} className={clsx(base, sizes[size], variants[variant], className)}>{children}</Link>;
}
