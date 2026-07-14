import type { Metadata } from 'next';
import './globals.css';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Mesh — Verifiable Evidence Passports',
  description:
    'Decentralized AI verification. Every digital claim deserves a verifiable Evidence Passport.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('font-sans', inter.variable)}>
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
