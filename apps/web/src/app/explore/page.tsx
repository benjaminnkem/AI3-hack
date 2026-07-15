'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Compass,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  RefreshCw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { getHistory, HistoryRow } from '@/lib/api';
import { cn, scoreMeta } from '@/lib/utils';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { Reveal, Stagger, StaggerItem, easeOutExpo, fadeUp } from '@/components/landing/Motion';

const TYPE_FILTERS = ['all', 'text', 'url', 'image'] as const;
const VERDICT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'true', label: 'True' },
  { id: 'likely_true', label: 'Likely true' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'likely_false', label: 'Likely false' },
  { id: 'false', label: 'False' },
] as const;

function getVerdictGroup(score: number | null): string {
  if (score == null) return 'unverifiable';
  if (score >= 85) return 'true';
  if (score >= 65) return 'likely_true';
  if (score >= 45) return 'mixed';
  if (score >= 25) return 'likely_false';
  return 'false';
}

function TypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'url') return <LinkIcon size={14} />;
  if (t === 'image') return <ImageIcon size={14} />;
  return <FileText size={14} />;
}

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'complete' || s === 'success') {
    return 'border-accent/25 bg-accent/10 text-accent';
  }
  if (s === 'failed' || s === 'error') {
    return 'border-danger/30 bg-danger/10 text-danger';
  }
  return 'border-white/10 bg-white/[0.04] text-muted';
}

function PassportCard({ item }: { item: HistoryRow }) {
  const score = item.truthScore != null ? Math.round(item.truthScore) : null;
  const meta = score != null ? scoreMeta(score) : null;
  const href = item.passport?.publicId ? `/passport/${item.passport.publicId}` : null;

  const body = (
    <motion.article
      layout
      whileHover={href ? { y: -4 } : undefined}
      className={cn(
        'group relative flex h-full min-h-[12.5rem] flex-col justify-between overflow-hidden rounded-3xl border border-white/8 bg-card/60 p-5 transition',
        href && 'hover:border-accent/25',
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
            <TypeIcon type={item.inputType} />
            {item.inputType}
          </span>
          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] capitalize', statusTone(item.status))}>
            {item.status}
          </span>
        </div>

        {score != null && meta ? (
          <div className="mb-3 flex items-end gap-2">
            <span className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: meta.color }}>
              {score}
            </span>
            <span className="mb-1 text-xs text-muted">/ 100 · {meta.label}</span>
          </div>
        ) : (
          <p className="mb-3 text-sm text-muted">Score pending</p>
        )}

        <p className="text-sm leading-relaxed text-muted">
          {item.status === 'completed' && score != null
            ? 'Evidence Passport registered and available for public audit.'
            : `Verification is currently ${item.status}.`}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-[11px] text-muted">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        {href ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent transition group-hover:underline">
            View passport
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-xs text-muted">No passport yet</span>
        )}
      </div>
    </motion.article>
  );

  if (!href) return body;
  return (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  );
}

export default function ExplorePage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [query, setQuery] = useState('');

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });

  const stats = useMemo(() => {
    const rows = data || [];
    const completed = rows.filter((r) => r.status?.toLowerCase() === 'completed').length;
    const withScore = rows.filter((r) => r.truthScore != null);
    const avg =
      withScore.length > 0
        ? Math.round(
            withScore.reduce((sum, r) => sum + (r.truthScore ?? 0), 0) / withScore.length,
          )
        : null;
    return {
      total: rows.length,
      completed,
      avg,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((item) => {
      const matchType =
        filterType === 'all' || item.inputType.toLowerCase() === filterType.toLowerCase();
      const matchVerdict =
        filterVerdict === 'all' || getVerdictGroup(item.truthScore) === filterVerdict;
      const matchQuery =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.inputType.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (item.passport?.publicId || '').toLowerCase().includes(q);
      return matchType && matchVerdict && matchQuery;
    });
  }, [data, filterType, filterVerdict, query]);

  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px]">
        <HeroBackdrop />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 sm:pt-14">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
          }}
          className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent shadow-[0_0_24px_-8px_rgba(34,229,154,0.55)]">
                <Compass size={13} />
                Public registry
              </span>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl"
            >
              Evidence Explorer
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Browse recent public passports processed by Mesh. Filter by input type and verdict,
              then open any passport for full audit detail.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:border-white/20"
            >
              <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
              Refresh
            </button>
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
            >
              Verify a claim
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        <Stagger className="mb-8 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Passports indexed', value: String(stats.total), icon: Activity },
            { label: 'Completed', value: String(stats.completed), icon: ShieldCheck },
            {
              label: 'Avg truth score',
              value: stats.avg != null ? String(stats.avg) : '-',
              icon: Search,
            },
          ].map(({ label, value, icon: Icon }) => (
            <StaggerItem key={label}>
              <div className="rounded-3xl border border-white/8 bg-card/50 px-5 py-4 backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
                  <Icon size={14} className="text-accent" />
                </div>
                <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal>
          <div className="mb-8 space-y-4 rounded-3xl border border-white/10 bg-card/60 p-5 backdrop-blur-xl sm:p-6">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by passport ID, type, or status…"
                className="w-full rounded-2xl border border-border bg-surface/80 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent/60 focus:ring-1 focus:ring-accent/20"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Input type
                </p>
                <div className="flex flex-wrap gap-2">
                  {TYPE_FILTERS.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFilterType(type)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition',
                        filterType === type
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-white',
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Verdict
                </p>
                <div className="flex flex-wrap gap-2">
                  {VERDICT_FILTERS.map((verdict) => (
                    <button
                      key={verdict.id}
                      type="button"
                      onClick={() => setFilterVerdict(verdict.id)}
                      className={cn(
                        'rounded-full border px-3.5 py-1.5 text-xs font-medium transition',
                        filterVerdict === verdict.id
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-white',
                      )}
                    >
                      {verdict.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-muted">
              <p>
                Showing{' '}
                <span className="font-semibold text-white tabular-nums">{filtered.length}</span>
                {data ? (
                  <>
                    {' '}
                    of <span className="tabular-nums">{data.length}</span>
                  </>
                ) : null}{' '}
                results
              </p>
              {(filterType !== 'all' || filterVerdict !== 'all' || query) && (
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all');
                    setFilterVerdict('all');
                    setQuery('');
                  }}
                  className="font-medium text-accent hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-3xl border border-white/5 bg-card/40"
              />
            ))}
          </div>
        ) : isError ? (
          <Reveal>
            <div className="rounded-3xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
              <p className="text-sm font-medium text-danger">Failed to load verification history</p>
              <p className="mt-2 text-xs text-muted">
                Check that the API is running and try refresh.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-danger/30 px-4 py-2 text-xs font-semibold text-danger transition hover:bg-danger/10"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          </Reveal>
        ) : filtered.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-white/10 bg-card/30 px-6 py-14 text-center">
              <p className="text-sm text-muted">
                {(data || []).length === 0
                  ? 'No passports yet. Run a verification to populate the explorer.'
                  : 'No matching passports for these filters.'}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {(data || []).length === 0 ? (
                  <Link
                    href="/verify"
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    Verify a claim
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('all');
                      setFilterVerdict('all');
                      setQuery('');
                    }}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              layout
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
            >
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.4, ease: easeOutExpo }}
                >
                  <PassportCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
