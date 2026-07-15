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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-white/[0.06]',
        className,
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function LoadingScreen({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const stepId = window.setInterval(() => {
      setActive((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    const timeId = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      window.clearInterval(stepId);
      window.clearInterval(timeId);
    };
  }, []);

  const progress = Math.min(92, ((active + 1) / STEPS.length) * 100);
  const CurrentIcon = STEPS[active]?.icon ?? ScanSearch;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Verification in progress"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative border-b border-white/5 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-accent/25"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0.5 rounded-full border-2 border-white/10 border-t-accent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="relative text-accent"
                >
                  <CurrentIcon size={18} />
                </motion.span>
              </AnimatePresence>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Working on your verification
              </p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={STEPS[active]?.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: easeOutExpo }}
                  className="mt-0.5 text-base font-semibold text-white"
                >
                  {STEPS[active]?.label}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-accent">
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-accent"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              Live
            </span>
            <span className="tabular-nums">Elapsed {formatElapsed(elapsed)}</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={STEPS[active]?.detail}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-muted"
          >
            {STEPS[active]?.detail}
          </motion.p>
        </AnimatePresence>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
            <span>
              Step {active + 1} of {STEPS.length}
            </span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="relative h-full rounded-full bg-accent shadow-glow"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.55, ease: easeOutExpo }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Multi-model review can take up to a minute. Keep this tab open.
          </p>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 border-b border-white/5 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Building passport
            </p>
            <motion.span
              className="text-[11px] text-accent"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              Preparing layout
            </motion.span>
          </div>

          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="relative mb-3 flex h-24 w-24 items-center justify-center">
                <Skeleton className="absolute inset-0 rounded-full" />
                <motion.div
                  className="absolute inset-1 rounded-full border-2 border-transparent border-t-accent/60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-2.5 w-20" />
            </div>

            <div className="space-y-3 rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-2 w-5/6" />
              <Skeleton className="h-2 w-4/6" />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-black/15 p-4"
              >
                <div className="mb-3 flex items-start gap-3">
                  <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className={cn('h-3', i === 1 ? 'w-4/5' : 'w-3/5')} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                {i < 2 ? (
                  <div className="mt-3 space-y-2 border-t border-white/5 pt-3">
                    <Skeleton className="h-2.5 w-full" />
                    <Skeleton className="h-2.5 w-5/6" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Pipeline status
          </p>
          <ol className="space-y-2">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i < active;
              const current = i === active;
              return (
                <motion.li
                  key={step.label}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3, ease: easeOutExpo }}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition',
                    current && 'border-accent/30 bg-accent/10',
                    done && 'border-white/5 bg-white/[0.02]',
                    !done && !current && 'border-transparent opacity-40',
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
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm font-medium',
                        current || done ? 'text-white' : 'text-muted',
                      )}
                    >
                      {step.label}
                    </p>
                    {current ? (
                      <p className="truncate text-[11px] text-muted">{step.detail}</p>
                    ) : null}
                  </div>
                  {done ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                      Done
                    </span>
                  ) : null}
                  {current ? (
                    <motion.span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      animate={{ opacity: [1, 0.25, 1], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ) : null}
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
