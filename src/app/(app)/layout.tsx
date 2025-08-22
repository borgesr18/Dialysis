// PASTA: src/app/(app)/layout.tsx
// ✅ CORRIGIDO: Import do ModernSidebar corrigido

'use client';

import { Suspense } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { 
  Menu, 
  Bell, 
  Search, 
  Settings, 
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ModernSidebar } from '@/components/ModernSidebar'; // ✅ CORRIGIDO: Import nomeado
import { ThemeToggle } from '@/components/ThemeToggle';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <ModernSidebar 
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className={clsx(
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}>
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  
                  {/* Search */}
                  <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar pacientes, registros..."
                      className="pl-10 w-80"
                    />
                  </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  
                  <Button variant="ghost" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                      3
                    </span>
                  </Button>
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center space-x-2"
                    >
                      <div className="hidden md:flex items-center space-x-2">
                        <Image 
                          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                          alt="Avatar do usuário"
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-blue-500"
                          priority
                        />
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dr. James Wilson</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Nefrologista</p>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>

                    {/* Dropdown Menu */}
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <User className="h-4 w-4 mr-2" />
                          Perfil
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurações
                        </a>
                        <hr className="my-1 border-gray-200 dark:border-gray-600" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  {children}
                </Suspense>
              </div>
            </div>
          </main>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </ToastProvider>
  );
}
