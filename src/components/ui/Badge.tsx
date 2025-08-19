import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
type Variant = 'default' | 'success' | 'neutral' | 'warning' | 'danger';
export default function Badge({ children, variant = 'default', className }: PropsWithChildren<{ variant?: Variant; className?: string }>) {
  const styles: Record<Variant, string> = {
    default: 'bg-gray-100 text-gray-700', success: 'bg-emerald-100 text-emerald-700',
    neutral: 'bg-neutral-100 text-neutral-700', warning: 'bg-yellow-100 text-yellow-800', danger: 'bg-red-100 text-red-700',
  };
  return <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', styles[variant], className)}>{children}</span>;
}
