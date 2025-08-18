import AppNav from '@/components/AppNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </>
  );
}
