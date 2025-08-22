'use client';

export const dynamic = 'force-dynamic';

import HeparinaDashboard from '@/components/heparina/HeparinaDashboard';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/Button';

export default function HeparinaDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard - Gestão de Heparina
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visão geral das doses de heparina por turno e alertas ativos
        </p>
      </div>
      
      <ErrorBoundary
        fallback={
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erro no Módulo de Heparina
              </h3>
              <p className="text-gray-600 mb-4">
                Não foi possível carregar os dados do módulo de heparina. Verifique sua conexão e tente novamente.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        }
      >
        <HeparinaDashboard />
      </ErrorBoundary>
    </div>
  );
}