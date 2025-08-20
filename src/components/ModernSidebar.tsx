'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { 
  Hospital, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Users,
  Calendar,
  Building,
  Clock,
  Settings,
  UserCog,
  Cog,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MAIN_MENU = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/pacientes', label: 'Pacientes', icon: Users },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/salas', label: 'Salas', icon: Building },
  { href: '/maquinas', label: 'Máquinas', icon: Clock },
  { href: '/turnos', label: 'Turnos', icon: Clock },
];

const ADMIN_MENU = [
  { href: '/admin/membros', label: 'Membros', icon: UserCog },
  { href: '/admin/config', label: 'Configuração', icon: Cog },
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
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-medical'
            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
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
          <Icon className="w-5 h-5" />
        </div>
        
        {/* Label */}
        {isOpen && (
          <span className="relative z-10 font-medium animate-fade-in">
            {item.label}
          </span>
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
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className={clsx(
            'flex items-center space-x-3 transition-all duration-300',
            !isOpen && 'justify-center'
          )}>
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-glow animate-float">
                <Hospital className="w-6 h-6 text-white" />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl opacity-20 blur-lg animate-pulse"></div>
            </div>
            
            {isOpen && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  NephroConnect
                </h1>
                <p className="text-xs text-gray-400">Dialysis Management</p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={onToggle}
            className={clsx(
              'p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200 group',
              !isOpen && 'mx-auto mt-2'
            )}
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        {/* Main Menu */}
        <div>
          {isOpen && (
            <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 animate-fade-in">
              Menu Principal
            </p>
          )}
          <div className="space-y-1">
            {MAIN_MENU.map((item) => (
              <MenuItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Admin Menu */}
        <div>
          {isOpen && (
            <p className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 animate-fade-in">
              Administração
            </p>
          )}
          <div className="space-y-1">
            {ADMIN_MENU.map((item) => (
              <MenuItem key={item.href} item={item} isAdmin />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700/50">
        <button className={clsx(
          'flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:bg-red-600/20 hover:text-red-400 w-full group',
          !isOpen && 'justify-center'
        )}>
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {isOpen && (
            <span className="font-medium animate-fade-in">Sair</span>
          )}
          
          {/* Tooltip for collapsed state */}
          {!isOpen && (
            <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Sair
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}