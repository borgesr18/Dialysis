'use client';
import clsx from 'clsx';
import type { InputHTMLAttributes, PropsWithChildren } from 'react';
export type InputProps = PropsWithChildren<InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }>;
export default function Input({ label, hint, className, id, ...props }: InputProps) {
  const input = (<input id={id} {...props} className={clsx('border border-gray-300 rounded-lg px-3 py-2 w-full bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent', className)} />);
  if (!label && !hint) return input;
  return (<div className="grid gap-1.5">{label && <label htmlFor={id} className="text-sm text-neutral-700">{label}</label>}{input}{hint && <p className="text-xs text-neutral-500">{hint}</p>}</div>);
}
