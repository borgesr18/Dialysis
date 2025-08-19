// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'Hemodiálise',
    template: '%s — Hemodiálise',
  },
  description: 'MVP de gestão de hemodiálise (Next.js 14 + Supabase + Tailwind).',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111111',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="${inter.variable} min-h-screen min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </body>
    </html>
  );
}
