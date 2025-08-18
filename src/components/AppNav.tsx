'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const items = [
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/salas',     label: 'Salas' },
  { href: '/turnos',    label: 'Turnos' },
  { href: '/agenda',    label: 'Agenda' },
];

export default function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Hemodiálise</Link>
        <nav className="flex gap-1">
          {items.map((it) => {
            const active = pathname?.startsWith(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm',
                  active ? 'bg-black text-white' : 'hover:bg-neutral-100',
                )}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
