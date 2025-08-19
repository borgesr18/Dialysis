'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
export default function Toast({ message, type = 'success', duration = 3500 }: { message?: string | null; type?: 'success' | 'error'; duration?: number }) {
  const [open, setOpen] = useState(!!message);
  useEffect(() => { if (!message) return; setOpen(true); const id = setTimeout(() => setOpen(false), duration); return () => clearTimeout(id); }, [message, duration]);
  if (!open || !message) return null;
  return (<div role="status" aria-live="polite" className={clsx('fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 shadow-lg text-sm', type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white')}>{message}</div>);
}
