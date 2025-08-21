'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { 
  Hospital, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Users,
  Calendar,
  Building,
  Settings,
  Clock,
  UserCog,
  Cog,
  LogOut,
  Activity,
  FileText,
  Syringe
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MAIN_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3, color: 'text-blue-400' },
  { href: '/sessoes', label: 'Sessões', icon: Activity, color: 'text-green-400' },
  { href: '/pacientes', label: 'Pacientes', icon: Users, color: 'text-blue-400' },
  { href: '/heparina', label: 'Heparina', icon: Syringe, color: 'text-red-400' },
  { href: '/maquinas', label: 'Máquinas', icon: Settings, color: 'text-purple-400' },
  { href: '/relatorios', label: 'Relatórios', icon: FileText, color: 'text-orange-400' },
  { href: '/agenda', label: 'Agenda', icon: Calendar, color: 'text-cyan-400' },
  { href: '/salas', label: 'Salas', icon: Building, color: 'text-gray-400' },
  { href: '/turnos', label: 'Turnos', icon: Clock, color: 'text-yellow-400' },
];

const ADMIN_MENU = [
  { href: '/admin/membros', label: 'Membros', icon: UserCog, color: 'text-cyan-400' },
  { href: '/admin/config', label: 'Configuração', icon: Cog, color: 'text-cyan-400' },
];

export function ModernSidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const MenuItem = ({ item, isAdmin = false }: { item: typeof MAIN_MENU[0], isAdmin?: boolean }) => {
    const isActive = pathname?.startsWith(item.href);
    const Icon = item.icon;
    
    return (
      <Link
        href={item.href}
        className={clsx(
          'flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
          isActive
            ? 'bg-gradient-medical text-white shadow-glow transform scale-105'
            : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 hover:text-white hover:shadow-soft hover:scale-102'
        )}
      >
        {/* Active Background Animation */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 animate-pulse" />
        )}
        
        {/* Icon */}
        <div className={clsx(
          'relative z-10 p-1 rounded-lg transition-all duration-300',
          isActive && 'animate-bounce-gentle'
        )}>
          <Icon className={clsx(
            'w-5 h-5 transition-all duration-300',
            isActive 
              ? 'text-white drop-shadow-lg' 
              : `${item.color} group-hover:text-white group-hover:drop-shadow-lg`
          )} />
        </div>
        
        {/* Label */}
        {isOpen && (
          <span className="relative z-10 font-medium animate-fade-in">
            {item.label}
          </span>
        )}
        
        {/* Active indicator with glow */}
        {isActive && (
          <div className="absolute right-3 w-2 h-2 bg-white rounded-full shadow-glow animate-pulse" />
        )}
        
        {/* Hover shimmer effect */}
        {!isActive && (
          <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Tooltip for collapsed state */}
        {!isOpen && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
            {item.label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        )}
      </Link>
    );
  };

  return (
    <aside className={clsx(
      'fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white z-30 transition-all duration-300 ease-in-out shadow-2xl border-r border-gray-700/50',
      isOpen ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-medical rounded-xl shadow-glow transition-all duration-300 hover:shadow-glow-success hover:scale-105">
              <Hospital className="h-6 w-6 text-white" />
            </div>
            {isOpen && (
              <div className="transition-all duration-300 animate-fade-in">
                <h1 className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  NephroConnect
                </h1>
                <p className="text-sm text-gray-400 font-medium">Sistema de Diálise</p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <Button
            onClick={onToggle}
            className="p-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition-all duration-300 shadow-soft hover:shadow-glow hover:scale-110 group"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-1">
          {MAIN_MENU.map((item) => (
            <MenuItem key={item.href} item={item} />
          ))}
        </div>

        {/* Admin Menu */}
        <div className="space-y-1 pt-4 border-t border-gray-700/30">
          {ADMIN_MENU.map((item) => (
            <MenuItem key={item.href} item={item} isAdmin />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700/50">
        <Button className={clsx(
          'flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 text-gray-300 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20 hover:text-red-400 w-full group hover:shadow-soft',
          !isOpen && 'justify-center'
        )}>
          <LogOut className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
          {isOpen && (
            <span className="font-medium transition-all duration-300">Sair</span>
          )}
          
          {/* Tooltip for collapsed state */}
          {!isOpen && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Sair
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}
        </Button>
      </div>
    </aside>
  );
}