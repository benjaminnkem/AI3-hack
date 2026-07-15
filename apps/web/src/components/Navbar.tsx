'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Menu, Network, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/verify', label: 'Verify' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'How it works' },
];

const TELEGRAM_URL = 'https://t.me/mesh_passport_bot';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/70 bg-background/80 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.65)] backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-10"
        aria-label="Primary navigation"
      >
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="relative flex h-8 w-8 items-center justify-center border border-accent/25 bg-accent/10 transition group-hover:border-accent/60">
            <Network className="text-accent" size={16} />
            <span className="absolute inset-0 bg-accent/20 opacity-0 blur-md transition group-hover:opacity-100" />
          </span>
          <span className="text-[15px]">MESH</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-2.5 py-2 text-xs transition hover:text-white',
                  active
                    ? 'text-white after:absolute after:inset-x-2.5 after:-bottom-3.5 after:h-px after:bg-accent'
                    : 'text-muted',
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <span className="mx-1 hidden items-center gap-2 border-l border-border pl-4 font-mono text-[9px] uppercase tracking-[0.14em] text-muted xl:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
            Ethereum Sepolia · 11155111
          </span>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs text-muted transition hover:text-white"
          >
            Telegram Bot <ExternalLink size={11} />
          </a>
          <Link
            href="/verify"
            className="ml-2 inline-flex min-h-10 items-center gap-2 bg-accent px-4 text-xs font-semibold text-background shadow-glow transition hover:opacity-90"
          >
            Try it now
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center border border-border bg-card/60 text-white md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div
              id="mobile-navigation"
              className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8"
            >
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={link.href}
                    className="block min-h-12 border-b border-border px-1 py-3 text-sm text-muted transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex min-h-12 items-center justify-between border-b border-border px-1 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Network <span className="text-accent">Ethereum Sepolia · 11155111</span>
              </div>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-between border-b border-border px-1 py-3 text-sm text-muted"
              >
                Telegram Bot <ExternalLink size={13} />
              </a>
              <Link
                href="/verify"
                className="mt-3 bg-accent px-4 py-3.5 text-center text-sm font-semibold text-background"
              >
                Try it now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
