'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowRight, Compass, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { getHistory } from '@/lib/api';
import { Passport } from '@/lib/types';
import { cn } from '@/lib/utils';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { Reveal, Stagger, StaggerItem, easeOutExpo, fadeUp } from '@/components/landing/Motion';
import { PassportListCard } from '@/components/PassportListCard';

const TYPE_FILTERS = ['all', 'text', 'url', 'image'] as const;
const VERDICT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'supported', label: 'Supported' },
  { id: 'unverified', label: 'Unverified' },
  { id: 'misleading', label: 'Misleading' },
  { id: 'contradicted', label: 'Contradicted' },
] as const;

function matchesVerdict(passport: Passport, filter: string): boolean {
  if (filter === 'all') return true;
  return passport.verdict.toLowerCase() === filter;
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
    const withScore = rows.filter((r) => typeof r.truthScore === 'number');
    const avg =
      withScore.length > 0
        ? Math.round(withScore.reduce((sum, r) => sum + r.truthScore, 0) / withScore.length)
        : null;
    const onChain = rows.filter(
      (r) =>
        (r.attestation?.status || '').toUpperCase() === 'CONFIRMED' ||
        !!r.attestation?.transactionHash,
    ).length;
    return {
      total: rows.length,
      onChain,
      avg,
    };
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data || []).filter((item) => {
      const matchType =
        filterType === 'all' || item.input.type.toLowerCase() === filterType.toLowerCase();
      const matchVerdict = matchesVerdict(item, filterVerdict);
      const haystack = [
        item.publicId,
        item.verificationId,
        item.input.type,
        item.input.displayText,
        item.input.sourceUrl || '',
        item.summary,
        item.verdict,
        item.attestation?.status || '',
        ...item.claims.map((c) => c.text),
      ]
        .join(' ')
        .toLowerCase();
      const matchQuery = !q || haystack.includes(q);
      return matchType && matchVerdict && matchQuery;
    });
  }, [data, filterType, filterVerdict, query]);

  return (
    <div className="product-page relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px]">
        <HeroBackdrop />
      </div>

      <div className="section-shell relative pb-24 pt-14 sm:pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
          }}
          className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-4xl">
            <motion.div variants={fadeUp}>
              <span className="section-label inline-flex items-center gap-2 border-l border-accent bg-accent/[0.06] px-3 py-2">
                <Compass size={13} />
                Public registry
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="product-page-heading mt-7">
              Evidence Explorer
            </motion.h1>
            <motion.p variants={fadeUp} className="section-copy mt-7">
              Browse public Evidence Passports from the Mesh API. Filter by input type and verdict,
              then open any passport for claims, evidence, models, and integrity roots.
            </motion.p>
            <motion.div variants={fadeUp} className="product-network-strip mt-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Registry network · Ethereum Sepolia · chain 11155111
            </motion.div>
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
            { label: 'Sepolia attestations', value: String(stats.onChain), icon: ShieldCheck },
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
                placeholder="Search passport ID, claim text, summary, URL…"
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
                <span className="font-semibold tabular-nums text-white">{filtered.length}</span>
                {data ? (
                  <>
                    {' '}
                    of <span className="tabular-nums">{data.length}</span>
                  </>
                ) : null}{' '}
                passports
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
                className="h-56 animate-pulse rounded-3xl border border-white/5 bg-card/40"
              />
            ))}
          </div>
        ) : isError ? (
          <Reveal>
            <div className="rounded-3xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
              <p className="text-sm font-medium text-danger">Failed to load passports</p>
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
                  key={item.publicId}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.4, ease: easeOutExpo }}
                >
                  <PassportListCard passport={item} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
