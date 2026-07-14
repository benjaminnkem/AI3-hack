'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ConsensusResult, PassportModelResponse } from '@/lib/types';
import { scoreMeta, shortHash } from '@/lib/utils';

interface Props {
  consensus: ConsensusResult;
  models: PassportModelResponse[];
}

export function ConsensusCard({ consensus, models }: Props) {
  return (
    <div className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Model Consensus</h3>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            consensus.disagreement
              ? 'bg-warn/10 text-warn'
              : 'bg-accent/10 text-accent'
          }`}
        >
          {consensus.disagreement ? (
            <>
              <AlertTriangle size={13} /> Contested
            </>
          ) : (
            <>
              <CheckCircle2 size={13} /> {Math.round(consensus.agreement * 100)}% aligned
            </>
          )}
        </span>
      </div>

      <div className="space-y-4">
        {models.map((m, i) => {
          const { color } = scoreMeta(m.score);
          return (
            <motion.div
              key={m.model}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium capitalize">{m.model}</span>
                <span className="tabular-nums font-semibold" style={{ color }}>
                  {Math.round(m.score)}/100
                </span>
              </div>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score}%` }}
                  transition={{ duration: 0.9, delay: i * 0.1 }}
                />
              </div>
              <p className="text-sm leading-relaxed text-muted">{m.reasoning}</p>
              {m.requestId && (
                <p className="mt-2 font-mono text-[11px] text-muted/70">
                  Gonka req: {shortHash(m.requestId, 5)}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-muted">{consensus.summary}</p>
    </div>
  );
}
