import { redirect } from 'next/navigation';

export default function Home() {
  // Se preferir abrir em Pacientes, troque para '/pacientes'
  redirect('/dashboard');
}
