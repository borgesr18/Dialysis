import './styles/globals.css';
import type { ReactNode } from 'react';

export const metadata = { title: 'Hemodiálise — MVP' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
