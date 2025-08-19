import Link from 'next/link';
import type { ReactNode } from 'react';
import { getMyRole } from '@/lib/roles';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const role = await getMyRole();
  const isAdmin = role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <aside className="hidden md:flex md:w-64 fixed inset-y-0 left-0 bg-secondary-800 text-white z-30">
        <div className="flex h-full w-full flex-col">
          <div className="p-5 border-b border-secondary-700">
            <div className="flex items-center space-x-3">
              <i className="fa-solid fa-hospital text-primary-400 text-2xl" />
              <div>
                <h1 className="text-lg font-bold">NephroConnect</h1>
                <p className="text-xs text-gray-400">Dialysis Management</p>
              </div>
            </div>
          </div>

          <nav className="py-4 px-2 flex-1 overflow-y-auto">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              MAIN MENU
            </p>

            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
            >
              <i className="fa-solid fa-gauge-high w-5 text-center" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/pacientes"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
            >
              <i className="fa-solid fa-user-group w-5 text-center" />
              <span>Pacientes</span>
            </Link>

            <Link
              href="/agenda"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
            >
              <i className="fa-solid fa-calendar-check w-5 text-center" />
              <span>Agenda</span>
            </Link>

            <Link
              href="/salas"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
            >
              <i className="fa-solid fa-pump-medical w-5 text-center" />
              <span>Salas</span>
            </Link>

            <Link
              href="/maquinas"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
            >
              <i className="fa-solid fa-microscope w-5 text-center" />
              <span>Máquinas</span>
            </Link>

            <Link
              href="/turnos"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
            >
              <i className="fa-solid fa-clock w-5 text-center" />
              <span>Turnos</span>
            </Link>

            {isAdmin && (
              <>
                <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mt-4 mb-2">
                  ADMIN
                </p>
                <Link
                  href="/admin/membros"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
                >
                  <i className="fa-solid fa-users-gear w-5 text-center" />
                  <span>Membros</span>
                </Link>
                <Link
                  href="/admin/config"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary-700 hover:text-white mb-1 transition-colors duration-200"
                >
                  <i className="fa-solid fa-gear w-5 text-center" />
                  <span>Configuração</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        <header className="bg-white py-3 px-4 sm:px-6 lg:px-8 border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Pacientes</h2>
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <input
                  className="bg-gray-100 rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
                  placeholder="Search…"
                  aria-label="Search"
                />
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                aria-label="Notificações"
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <i className="fa-regular fa-bell text-xl" />
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                  3
                </span>
              </button>
              <div className="flex items-center gap-2">
                <img
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg"
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border-2 border-primary-500"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} NephroConnect</p>
            <div className="flex gap-4 mt-2 md:mt-0 text-sm text-gray-500">
              <span className="cursor-pointer hover:text-gray-700">Privacy</span>
              <span className="cursor-pointer hover:text-gray-700">Terms</span>
              <span className="cursor-pointer hover:text-gray-700">Help</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
