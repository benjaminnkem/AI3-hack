'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/verify', label: 'Verify' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'About' },
];

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
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 transition group-hover:border-accent/40 group-hover:bg-accent/15">
            <ShieldCheck className="text-accent" size={18} />
            <span className="absolute inset-0 rounded-xl bg-accent/20 opacity-0 blur-md transition group-hover:opacity-100" />
          </span>
          <span className="text-[15px]">Mesh</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-lg px-3.5 py-2 text-sm transition',
                  active ? 'text-white' : 'text-muted hover:text-white',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.06]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
          <Link
            href="/verify"
            className="ml-3 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
          >
            Launch App
          </Link>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 text-white md:hidden"
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
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.04 * i }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'block rounded-xl px-3 py-3 text-sm transition',
                      pathname === link.href
                        ? 'bg-white/[0.06] text-white'
                        : 'text-muted hover:bg-white/[0.04] hover:text-white',
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/verify"
                className="mt-2 rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-background"
              >
                Launch App
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
