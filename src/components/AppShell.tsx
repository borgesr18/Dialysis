'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import clsx from 'clsx';

const MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
  { href: '/pacientes', label: 'Pacientes', icon: 'fa-user-group' },
  { href: '/agenda',    label: 'Agenda',    icon: 'fa-calendar-check' },
  { href: '/salas',     label: 'Salas',     icon: 'fa-pump-medical' },
  { href: '/turnos',    label: 'Turnos',    icon: 'fa-clock' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside
        id="sidebar"
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-secondary-800 text-white z-30 transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'shadow-[4px_0_10px_rgba(0,0,0,0.1)]'
        )}
      >
        <div className="p-5 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <i className="fa-solid fa-hospital text-primary-400 text-2xl" />
            <div>
              <h1 className="text-lg font-bold">NephroConnect</h1>
              <p className="text-xs text-gray-400">Dialysis Management</p>
            </div>
          </div>
        </div>

        <div className="py-4 px-2">
          <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            MAIN MENU
          </p>

          {MENU.map((m) => {
            const active = pathname?.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors duration-200',
                  active
                    ? 'bg-secondary-700 text-white'
                    : 'text-gray-300 hover:bg-secondary-700 hover:text-white'
                )}
              >
                <i className={clsx('fa-solid w-5 text-center', m.icon)} />
                <span>{m.label}</span>
              </Link>
            );
          })}

          <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mt-6 mb-2">
            SETTINGS
          </p>
          <button className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white transition-colors duration-200">
            <i className="fa-solid fa-gear w-5 text-center" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className={clsx('bg-white py-4 px-6 flex items-center justify-between border-b border-gray-200 sticky top-0 z-20',
        open ? 'ml-64' : 'ml-0')}>
        <div className="flex items-center">
          <button onClick={() => setOpen((v) => !v)} className="mr-4 text-gray-500 hover:text-gray-700">
            <i className="fa-solid fa-bars" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {MENU.find((m) => pathname?.startsWith(m.href))?.label ?? 'Dashboard'}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
            />
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <i className="fa-regular fa-bell text-xl" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
              3
            </span>
          </button>
          <div className="hidden md:flex items-center space-x-2">
            <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                 className="w-10 h-10 rounded-full border-2 border-primary-500" alt="avatar" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">Dr. James Wilson</p>
              <p className="text-xs text-gray-500">Nephrologist</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={clsx('p-6 transition-all', open ? 'ml-64' : 'ml-0')}>{children}</main>
    </div>
  );
}
