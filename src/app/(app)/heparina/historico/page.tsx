export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import HeparinaHistorico from '@/components/heparina/HeparinaHistorico';

export const metadata: Metadata = {
  title: 'Histórico - Gestão de Heparina | Sistema de Diálise',
  description: 'Histórico completo de alterações de doses de heparina',
};

export default function HeparinaHistoricoPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Histórico - Alterações de Heparina
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visualize o histórico completo de alterações de doses com auditoria
        </p>
      </div>
      
      <HeparinaHistorico />
    </div>
  );
}