import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ProofMesh — Verifiable Evidence Passports',
  description: 'Decentralized AI verification. Every digital claim deserves a verifiable Evidence Passport.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
