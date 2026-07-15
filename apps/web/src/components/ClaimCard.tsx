'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { PassportClaim, PassportEvidence, AdversarialChallenge } from '@/lib/types';
import { cn, directionMeta, formatScore, shortHash, verdictMeta } from '@/lib/utils';

function claimIcon(verdict: string) {
  const v = verdict.toLowerCase();
  if (v === 'supported') return { Icon: CheckCircle2, className: 'text-accent' };
  if (v === 'contradicted') return { Icon: XCircle, className: 'text-danger' };
  if (v === 'misleading') return { Icon: AlertCircle, className: 'text-[#f0913a]' };
  return { Icon: HelpCircle, className: 'text-warn' };
}

function EvidenceItem({ item }: { item: PassportEvidence }) {
  const dir = directionMeta(item.direction);
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3.5">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug text-white">{item.title}</p>
        <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold', dir.className)}>
          {dir.label}
        </span>
      </div>
      {item.excerpt ? (
        <p className="text-xs leading-relaxed text-muted">{item.excerpt}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition hover:text-white"
          >
            {item.domain || 'Source'}
            <ExternalLink size={10} />
          </a>
        ) : (
          <span>{item.domain || 'Source'}</span>
        )}
        <div className="flex flex-wrap gap-2 tabular-nums">
          <span>Relevance {formatScore(item.relevanceScore <= 1 ? item.relevanceScore * 100 : item.relevanceScore)}</span>
          <span>Quality {formatScore(item.sourceQualityScore)}</span>
          {item.publishedAt ? (
            <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ClaimCard({
  claim,
  challenges = [],
}: {
  claim: PassportClaim;
  challenges?: AdversarialChallenge[];
}) {
  const [open, setOpen] = useState(true);
  const meta = verdictMeta(claim.verdict);
  const { Icon, className } = claimIcon(claim.verdict);
  const claimChallenges = challenges.filter((c) => c.claimId === claim.id);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-card/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 p-5 text-left transition hover:bg-white/[0.02]"
      >
        <Icon size={18} className={cn('mt-0.5 shrink-0', className)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-relaxed text-white">{claim.text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', meta.className)}>
              {meta.label}
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-muted">
              Truth {formatScore(claim.truthScore)}/100
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-muted">
              Confidence {formatScore(claim.confidenceScore)}/100
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-muted">
              Importance {claim.importance}/5
            </span>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-muted">
              {claim.evidence.length} source{claim.evidence.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={cn('mt-1 shrink-0 text-muted transition', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/5 px-5 pb-5 pt-4">
              {claim.reasoningSummary ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Reasoning
                  </p>
                  <p className="text-sm leading-relaxed text-muted">{claim.reasoningSummary}</p>
                </div>
              ) : null}

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Evidence
                </p>
                {claim.evidence.length > 0 ? (
                  <div className="space-y-2.5">
                    {claim.evidence.map((item) => (
                      <EvidenceItem key={item.id || item.url} item={item} />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-xs text-muted">
                    No evidence records were stored for this claim.
                  </p>
                )}
              </div>

              {claimChallenges.length > 0 ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Adversarial challenges
                  </p>
                  {claimChallenges.map((challenge, idx) => (
                    <div
                      key={`${challenge.claimId}-${idx}`}
                      className="rounded-2xl border border-warn/20 bg-warn/5 p-3.5"
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-warn">
                          {challenge.resolved ? 'Resolved challenge' : 'Open challenge'}
                        </span>
                        <span className="rounded bg-warn/15 px-1.5 py-0.5 text-[10px] font-semibold text-warn">
                          Severity {formatScore(challenge.severity)}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed text-muted">{challenge.challenge}</p>
                      {challenge.resolution ? (
                        <p className="mt-2 border-t border-warn/10 pt-2 text-[11px] text-muted">
                          <span className="font-semibold text-white/80">Resolution: </span>
                          {challenge.resolution}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {claim.claimHash ? (
                <p className="font-mono text-[10px] text-muted/70">
                  Claim hash {shortHash(claim.claimHash, 8)}
                </p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
