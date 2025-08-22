export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import HeparinaRelatorios from '@/components/heparina/HeparinaRelatorios';

export const metadata: Metadata = {
  title: 'Relatórios - Gestão de Heparina | Sistema de Diálise',
  description: 'Relatórios e análises de doses de heparina',
};

export default function HeparinaRelatoriosPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Relatórios - Gestão de Heparina
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Análises e relatórios detalhados sobre o uso de heparina
        </p>
      </div>
      
      <HeparinaRelatorios />
    </div>
  );
}