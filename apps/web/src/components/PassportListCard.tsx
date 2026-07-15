'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';
import { Passport } from '@/lib/types';
import { cn, formatScore, shortHash, verdictMeta } from '@/lib/utils';

function TypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'url') return <LinkIcon size={13} />;
  if (t === 'image') return <ImageIcon size={13} />;
  return <FileText size={13} />;
}

function previewText(passport: Passport): string {
  const display = passport.input.displayText?.trim();
  if (display) return display;
  if (passport.input.sourceUrl) return passport.input.sourceUrl;
  if (passport.summary?.trim()) return passport.summary.trim();
  return 'No input preview available.';
}

function summaryText(passport: Passport): string | null {
  const summary = passport.summary?.trim();
  if (!summary) return null;
  const preview = previewText(passport);
  if (summary === preview) return null;
  return summary;
}

function attestationLabel(passport: Passport): { label: string; className: string } {
  const status = (passport.attestation?.status || '').toUpperCase();
  if (status === 'CONFIRMED' || passport.attestation?.transactionHash) {
    return {
      label: 'Sepolia attested',
      className: 'border-accent/30 bg-accent/10 text-accent',
    };
  }
  if (status === 'FAILED') {
    return {
      label: 'Sepolia failed',
      className: 'border-danger/30 bg-danger/10 text-danger',
    };
  }
  if (status === 'PENDING') {
    return {
      label: 'Sepolia pending',
      className: 'border-warn/30 bg-warn/10 text-warn',
    };
  }
  if (status === 'DISABLED' || !passport.attestation) {
    return {
      label: 'Off-chain',
      className: 'border-white/10 bg-white/[0.03] text-muted',
    };
  }
  return {
    label: status || 'Unattested',
    className: 'border-white/10 bg-white/[0.03] text-muted',
  };
}

export function PassportListCard({
  passport,
  compact = false,
}: {
  passport: Passport;
  compact?: boolean;
}) {
  const href = `/passport/${passport.publicId}`;
  const meta = verdictMeta(passport.verdict);
  const scoreMetaFallback = verdictMeta(
    passport.truthScore >= 70
      ? 'supported'
      : passport.truthScore >= 50
        ? 'unverified'
        : passport.truthScore >= 25
          ? 'misleading'
          : 'contradicted',
  );
  const color = meta.color || scoreMetaFallback.color;
  const attest = attestationLabel(passport);
  const preview = previewText(passport);
  const summary = summaryText(passport);
  const claimCount = passport.claims.length;
  const evidenceCount = passport.evidence.length;
  const agreement = passport.consensus.agreement;
  const kimi = passport.modelResponses.find((m) => /kimi/i.test(m.modelId || m.model));
  const minimax = passport.modelResponses.find((m) => /minimax/i.test(m.modelId || m.model));

  return (
    <Link href={href} className="block h-full">
      <motion.article
        layout
        whileHover={{ y: -4 }}
        className={cn(
          'group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/8 bg-card/60 p-5 transition hover:border-accent/25',
          compact ? 'min-h-[13rem]' : 'min-h-[15.5rem]',
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
              <TypeIcon type={passport.input.type} />
              {passport.input.type}
            </span>
            <span
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                meta.className,
              )}
            >
              {meta.label}
            </span>
          </div>

          <div className="mb-3 flex items-end justify-between gap-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color }}>
                {formatScore(passport.truthScore)}
              </span>
              <span className="mb-1 text-xs text-muted">/ 100</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Confidence</p>
              <p className="text-sm font-semibold tabular-nums text-white/90">
                {formatScore(passport.confidenceScore)}
              </p>
            </div>
          </div>

          <p className="line-clamp-2 text-sm font-medium leading-relaxed text-white/90">
            {preview}
          </p>

          {summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{summary}</p>
          ) : null}

          {!compact ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                {claimCount} claim{claimCount === 1 ? '' : 's'}
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                {evidenceCount} source{evidenceCount === 1 ? '' : 's'}
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                Agree {formatScore(agreement)}%
              </span>
              <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', attest.className)}>
                {attest.label}
              </span>
            </div>
          ) : null}

          {!compact && (kimi || minimax) ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {kimi ? (
                <div className="rounded-xl border border-white/5 bg-black/20 px-2.5 py-2">
                  <p className="truncate text-[10px] text-muted">Kimi</p>
                  <p className="text-sm font-semibold tabular-nums">{formatScore(kimi.score)}</p>
                </div>
              ) : (
                <div />
              )}
              {minimax ? (
                <div className="rounded-xl border border-white/5 bg-black/20 px-2.5 py-2">
                  <p className="truncate text-[10px] text-muted">MiniMax</p>
                  <p className="text-sm font-semibold tabular-nums">{formatScore(minimax.score)}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 pt-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] text-muted" title={passport.publicId}>
              {shortHash(passport.publicId, 5) || passport.publicId}
            </p>
            <p className="text-[10px] text-muted/80">
              {new Date(passport.generatedAt).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent transition group-hover:underline">
            <ShieldCheck size={12} />
            Open
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </motion.article>
    </Link>
  );
}
