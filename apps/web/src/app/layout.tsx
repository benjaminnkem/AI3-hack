import type { Metadata } from 'next';
import './globals.css';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'Mesh | Verifiable Evidence Passports',
  description:
    'Decentralized AI verification. Every digital claim deserves a verifiable Evidence Passport.',
  openGraph: {
    title: 'Mesh | Verifiable Evidence Passports',
    description:
      'Portable, multi-model, tamper-evident investigations for people, applications, and AI agents.',
    type: 'website',
    images: [{ url: '/og.png', width: 1733, height: 908, alt: 'Mesh Evidence Passport protocol' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mesh | Verifiable Evidence Passports',
    description: 'Do not trust the claim. Verify the evidence.',
    images: ['/og.png'],
  },
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
