'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { 
  Menu, 
  Search, 
  Bell
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthProvider } from '@/hooks/useAuth';
import { ModernSidebar } from '@/components/ModernSidebar';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sessoes', label: 'Sessões' },
  { href: '/pacientes', label: 'Pacientes' },
  { href: '/heparina', label: 'Heparina' },
  { href: '/maquinas', label: 'Máquinas' },
  { href: '/relatorios', label: 'Relatórios' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/salas', label: 'Salas' },
  { href: '/turnos', label: 'Turnos' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Modern Sidebar */}
        <ModernSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Header */}
        <header className={clsx(
          'bg-white dark:bg-gray-800 py-4 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {MENU.find((m) => pathname?.startsWith(m.href))?.label ?? 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-gray-100 dark:bg-gray-700 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <ThemeToggle />
            <button className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                3
              </span>
            </button>
            <div className="hidden md:flex items-center space-x-2">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                   className="w-10 h-10 rounded-full border-2 border-blue-500" alt="avatar" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dr. James Wilson</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nefrologista</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className={clsx(
          'transition-all duration-300 min-h-screen p-6',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}>
          {children}
        </main>
    </div>
    </AuthProvider>
  );
}
