import { Metadata } from 'next';
import LancamentoHeparina from '@/components/heparina/LancamentoHeparina';

export const metadata: Metadata = {
  title: 'Lançamento de Heparina | Sistema de Hemodiálise',
  description: 'Lançamento e alteração diária das quantidades de heparina por sala',
};

export default function LancamentoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lançamento de Heparina
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie as doses de heparina dos pacientes organizadas por sala e turno
          </p>
        </div>
        
        <LancamentoHeparina />
      </div>
    </div>
  );
}