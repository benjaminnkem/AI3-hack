'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, GitBranch, Link2, Sparkles } from 'lucide-react';
import { easeOutExpo } from './Motion';

export function PassportPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.25, ease: easeOutExpo }}
      className="relative mx-auto w-full max-w-md perspective-[1200px]"
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-accent/10 blur-3xl" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/80 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Sparkles size={15} />
            </span>
            <div>
              <p className="text-xs font-medium text-white">Evidence Passport</p>
              <p className="font-mono text-[10px] text-muted">mesh_7f3a…c91e</p>
            </div>
          </div>
          <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
            Supported
          </span>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Truth Score</p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-white">
                84
                <span className="text-lg font-medium text-muted">/100</span>
              </p>
            </div>
            <div className="relative h-16 w-16">
              <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  stroke="#22e59a"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={163.36}
                  initial={{ strokeDashoffset: 163.36 }}
                  animate={{ strokeDashoffset: 163.36 * (1 - 0.84) }}
                  transition={{ duration: 1.4, delay: 0.6, ease: easeOutExpo }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-accent">
                84%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Kimi-K2.6', score: 87, color: '#22e59a' },
              { label: 'MiniMax-M2.7', score: 81, color: '#5eead4' },
            ].map((model, i) => (
              <div
                key={model.label}
                className="rounded-2xl border border-white/5 bg-white/[0.03] p-3"
              >
                <p className="truncate text-[10px] text-muted">{model.label}</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: model.color }}>
                  {model.score}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: model.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${model.score}%` }}
                    transition={{ duration: 1, delay: 0.75 + i * 0.12, ease: easeOutExpo }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {[
              { icon: CheckCircle2, text: '3 atomic claims extracted', tone: 'text-accent' },
              { icon: GitBranch, text: 'Models agree within 6 pts', tone: 'text-emerald-300' },
              { icon: Link2, text: 'Anchored on Ethereum Sepolia', tone: 'text-cyan-300' },
            ].map((row, i) => (
              <motion.div
                key={row.text}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.45, ease: easeOutExpo }}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5"
              >
                <row.icon size={14} className={row.tone} />
                <span className="text-xs text-muted">{row.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
