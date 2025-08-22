export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Gestão de Heparina | Sistema de Diálise',
  description: 'Módulo para gestão e controle de doses de heparina',
};

export default function HeparinaPage() {
  // Redireciona para o dashboard por padrão
  redirect('/heparina/dashboard');
}