'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBadge = pathname?.startsWith('/badge');
  const isHome = pathname === '/';

  if (isBadge) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className={isHome ? 'min-h-screen' : 'mx-auto min-h-screen max-w-6xl px-6 py-10'}>
        {children}
      </main>
      <Footer />
    </>
  );
}
