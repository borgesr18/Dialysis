'use client';
import clsx from 'clsx';
import type { PropsWithChildren, SelectHTMLAttributes } from 'react';
export type SelectProps = PropsWithChildren<SelectHTMLAttributes<HTMLSelectElement> & { label?: string; hint?: string }>;
export default function Select({ label, hint, className, id, children, ...props }: SelectProps) {
  const select = (<select id={id} {...props} className={clsx('border border-gray-300 rounded-lg px-3 py-2 w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent', className)}>{children}</select>);
  if (!label && !hint) return select;
  return (<div className="grid gap-1.5">{label && <label htmlFor={id} className="text-sm text-neutral-700">{label}</label>}{select}{hint && <p className="text-xs text-neutral-500">{hint}</p>}</div>);
}
