'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ExternalLink, Network } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/verify', label: 'Verify' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'About' },
  { href: '/video', label: 'Demo Video' },
];

const TELEGRAM_URL = 'https://t.me/mesh_passport_bot';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border/60">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between"
        >
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2.5 font-semibold tracking-wide">
              <span className="flex h-9 w-9 items-center justify-center border border-accent/20 bg-accent/10">
                <Network className="text-accent" size={18} />
              </span>
              MESH
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Every digital claim deserves a verifiable Evidence Passport: multi-model,
              evidence-backed, and tamper-evident on Ethereum Sepolia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-sm text-muted">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-white"
            >
              Telegram <ExternalLink size={11} />
            </a>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/50 pt-6 text-xs text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Mesh Protocol · Ethereum Sepolia</p>
          <p className="max-w-2xl sm:text-right">
            Decision-support based on available evidence and model consensus—not an absolute
            authority.
          </p>
        </div>
      </div>
    </footer>
  );
}
