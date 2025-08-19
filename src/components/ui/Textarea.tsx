'use client';
import clsx from 'clsx';
import type { PropsWithChildren, TextareaHTMLAttributes } from 'react';
export type TextareaProps = PropsWithChildren<TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }>;
export default function Textarea({ label, hint, className, id, ...props }: TextareaProps) {
  const ta = (<textarea id={id} {...props} className={clsx('border border-gray-300 rounded-lg px-3 py-2 w-full bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent', className)} />);
  if (!label && !hint) return ta;
  return (<div className="grid gap-1.5">{label && <label htmlFor={id} className="text-sm text-neutral-700">{label}</label>}{ta}{hint && <p className="text-xs text-neutral-500">{hint}</p>}</div>);
}
