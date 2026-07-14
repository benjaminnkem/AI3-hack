'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="text-accent" size={22} />
          ProofMesh
        </Link>
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/verify" className="transition hover:text-white">
            Verify
          </Link>
          <Link href="/history" className="transition hover:text-white">
            History
          </Link>
          <Link href="/about" className="transition hover:text-white">
            About
          </Link>
          <Link
            href="/verify"
            className="rounded-lg bg-accent px-4 py-2 font-medium text-background transition hover:opacity-90"
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}
