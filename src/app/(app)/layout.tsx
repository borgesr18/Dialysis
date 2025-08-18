import '../globals.css';
import Link from 'next/link';
import { createClient } from '@/src/lib/supabase-server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <html lang="pt-BR">
      <body>
        <header className="border-b bg-white">
          <div className="container flex items-center justify-between py-3">
            <Link href="/dashboard" className="font-semibold">Hemodiálise — MVP</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/pacientes">Pacientes</Link>
              <Link href="/salas">Salas</Link>
              <Link href="/turnos">Turnos</Link>
              <Link href="/agenda">Agenda</Link>
            </nav>
          </div>
        </header>
        <main className="container py-6">{children}</main>
      </body>
    </html>
  );
}
