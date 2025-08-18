// src/app/(app)/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  // O CSS global é importado em src/app/layout.tsx (root)
  return <>{children}</>;
}

