import { Metadata } from 'next';
import HeparinaDashboard from '@/components/heparina/HeparinaDashboard';

export const metadata: Metadata = {
  title: 'Dashboard - Gestão de Heparina | Sistema de Diálise',
  description: 'Visão geral das doses de heparina por turno',
};

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
      
      <HeparinaDashboard />
    </div>
  );
}