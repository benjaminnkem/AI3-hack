'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ConsensusResult, PassportModelResponse } from '@/lib/types';
import { cn, formatScore, shortHash, verdictMeta } from '@/lib/utils';

interface Props {
  consensus: ConsensusResult;
  models: PassportModelResponse[];
}

export function ConsensusCard({ consensus, models }: Props) {
  return (
    <div className="h-full rounded-3xl border border-white/8 bg-card/60 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Model consensus</h3>
          <p className="mt-1 text-xs text-muted">
            Independent investigators via Gonka Router
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
            consensus.disagreement
              ? 'border-warn/30 bg-warn/10 text-warn'
              : 'border-accent/30 bg-accent/10 text-accent',
          )}
        >
          {consensus.disagreement ? (
            <>
              <AlertTriangle size={13} />
              Contested
            </>
          ) : (
            <>
              <CheckCircle2 size={13} />
              {formatScore(consensus.agreement)}% aligned
            </>
          )}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Agreement</p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatScore(consensus.agreement)}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted">Confidence</p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {formatScore(consensus.confidenceScore)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {models.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted">
            No model responses were returned for this passport.
          </p>
        ) : (
          models.map((m, i) => {
            const meta = verdictMeta(m.verdict);
            return (
              <motion.div
                key={m.modelId || m.model}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/8 bg-black/20 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{m.model}</p>
                    <p className="text-[11px] text-muted">
                      Confidence {formatScore(m.confidence)}/100
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                      {formatScore(m.score)}
                      <span className="text-xs font-medium text-muted">/100</span>
                    </p>
                    <span
                      className={cn(
                        'inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                        meta.className,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                </div>
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: meta.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
                    transition={{ duration: 0.9, delay: i * 0.08 }}
                  />
                </div>
                {m.reasoning ? (
                  <p className="text-sm leading-relaxed text-muted">{m.reasoning}</p>
                ) : null}
                {m.requestId ? (
                  <p className="mt-2 font-mono text-[11px] text-muted/70">
                    Gonka response {shortHash(m.requestId, 6)}
                  </p>
                ) : null}
              </motion.div>
            );
          })
        )}
      </div>

      {consensus.disagreements.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-warn/20 bg-warn/5 p-4">
          <p className="mb-2 text-xs font-semibold text-warn">Recorded disagreements</p>
          <ul className="space-y-1.5">
            {consensus.disagreements.map((item) => (
              <li key={item} className="text-xs leading-relaxed text-muted">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {consensus.summary ? (
        <p className="mt-5 border-t border-white/5 pt-4 text-sm leading-relaxed text-muted">
          {consensus.summary}
        </p>
      ) : null}
    </div>
  );
}
