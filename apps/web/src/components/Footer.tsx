'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const LINKS = [
  { href: '/verify', label: 'Verify' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'About' },
];

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/60">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between"
        >
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2.5 font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                <ShieldCheck className="text-accent" size={18} />
              </span>
              Mesh
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Every digital claim deserves a verifiable Evidence Passport: multi-model, evidence-backed,
              and tamper-evident on Ethereum Sepolia.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/50 pt-6 text-xs text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mesh Protocol</p>
          <p>AI³ Growth Hackathon · Track 3 · Powered by Gonka</p>
        </div>
      </div>
    </footer>
  );
}
