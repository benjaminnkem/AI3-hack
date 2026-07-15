'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Boxes,
  FileSearch,
  GitBranch,
  Link2,
  Network,
  ScanSearch,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { easeOutExpo } from '@/components/landing/Motion';

const STEPS = [
  {
    label: 'Resolving input',
    detail: 'Normalizing text, URL content, or image transcript',
    icon: ScanSearch,
  },
  {
    label: 'Extracting claims',
    detail: 'Isolating independently verifiable factual claims',
    icon: FileSearch,
  },
  {
    label: 'Gathering evidence',
    detail: 'Pulling supporting and opposing sources from the live web',
    icon: Network,
  },
  {
    label: 'Kimi investigation',
    detail: 'Running Kimi-K2.6 through Gonka Router',
    icon: Sparkles,
  },
  {
    label: 'MiniMax investigation',
    detail: 'Running MiniMax-M2.7 independently through Gonka',
    icon: GitBranch,
  },
  {
    label: 'Building consensus',
    detail: 'Scoring agreement, confidence, and adversarial challenges',
    icon: Boxes,
  },
  {
    label: 'Anchoring passport',
    detail: 'Hashing the Evidence Passport and preparing attestation',
    icon: Link2,
  },
];

export function LoadingScreen({ className }: { className?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  const progress = ((active + 1) / STEPS.length) * 100;
  const CurrentIcon = STEPS[active]?.icon ?? ScanSearch;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full border border-accent/20"
            animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0.15, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-1 rounded-full border-2 border-border border-t-accent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          />
          <AnimatePresence mode="wait">
            <motion.span
              key={active}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="relative text-accent"
            >
              <CurrentIcon size={22} />
            </motion.span>
          </AnimatePresence>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Verification in progress
        </p>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: easeOutExpo }}
            className="mt-3"
          >
            <h3 className="text-xl font-semibold tracking-tight text-white">
              {STEPS[active]?.label}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted">{STEPS[active]?.detail}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-accent shadow-glow"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          />
        </div>
        <p className="mt-2 text-[11px] tabular-nums text-muted">
          Step {active + 1} of {STEPS.length}
        </p>
      </div>

      <ol className="relative mt-8 space-y-2">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const done = i < active;
          const current = i === active;
          return (
            <motion.li
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35, ease: easeOutExpo }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition',
                current && 'border-accent/30 bg-accent/10',
                done && 'border-white/5 bg-white/[0.02]',
                !done && !current && 'border-transparent bg-transparent opacity-45',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border',
                  current && 'border-accent/30 bg-accent/15 text-accent',
                  done && 'border-accent/20 bg-accent/10 text-accent',
                  !done && !current && 'border-white/8 bg-white/[0.03] text-muted',
                )}
              >
                <Icon size={14} />
              </span>
              <div className="min-w-0 flex-1 text-left">
                <p
                  className={cn(
                    'truncate text-sm font-medium',
                    current || done ? 'text-white' : 'text-muted',
                  )}
                >
                  {step.label}
                </p>
              </div>
              {done && (
                <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                  Done
                </span>
              )}
              {current && (
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-accent"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
