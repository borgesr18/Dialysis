export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import HeparinaConsulta from '@/components/heparina/HeparinaConsulta';

export const metadata: Metadata = {
  title: 'Consulta Rápida - Gestão de Heparina | Sistema de Diálise',
  description: 'Consulta e edição rápida de doses de heparina',
};

export default function HeparinaConsultaPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Consulta Rápida - Heparina
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Busque e edite doses de heparina de forma rápida e eficiente
        </p>
      </div>
      
      <HeparinaConsulta />
    </div>
  );
}