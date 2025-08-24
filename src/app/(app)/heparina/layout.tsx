'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Search, 
  History, 
  FileText,
  Syringe
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/heparina/dashboard',
    icon: Activity,
    description: 'Visão geral das doses'
  },
  {
    name: 'Lançamento',
    href: '/heparina/lancamento',
    icon: Syringe,
    description: 'Lançar doses por sala'
  },
  {
    name: 'Consulta Rápida',
    href: '/heparina/consulta',
    icon: Search,
    description: 'Buscar e editar doses'
  },
  {
    name: 'Histórico',
    href: '/heparina/historico',
    icon: History,
    description: 'Alterações e auditoria'
  },
  {
    name: 'Relatórios',
    href: '/heparina/relatorios',
    icon: FileText,
    description: 'Análises e estatísticas'
  }
];

export default function HeparinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Syringe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Gestão de Heparina
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Controle e monitoramento de doses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}