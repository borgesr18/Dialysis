// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

import EnvDebug from '@/components/debug/EnvDebug'
import ErrorBoundary from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Diálise',
  description: 'Sistema de gerenciamento para clínicas de diálise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
          <Toaster position="top-right" />
          <EnvDebug />
        </ErrorBoundary>
      </body>
    </html>
  )
}
