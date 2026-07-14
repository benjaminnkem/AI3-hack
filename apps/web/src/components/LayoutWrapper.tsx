'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBadge = pathname?.startsWith('/badge');

  if (isBadge) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">{children}</main>
      <Footer />
    </>
  );
}
