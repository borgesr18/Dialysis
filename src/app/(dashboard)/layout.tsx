// src/app/(dashboard)/layout.tsx (ou seu layout principal)
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {/* Aqui pode ter seu header, sidebar, etc. */}
      <main>{children}</main>
      <Toaster />
    </section>
  )
}
