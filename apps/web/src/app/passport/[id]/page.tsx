'use client';

import Link from 'next/link';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { getPassport } from '@/lib/api';
import { PassportView } from '@/components/PassportView';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { fadeUp } from '@/components/landing/Motion';

export default function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError, isFetching, refetch, error } = useQuery({
    queryKey: ['passport', id],
    queryFn: () => getPassport(id),
  });

  return (
    <div className="product-page relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px]">
        <HeroBackdrop />
      </div>

      <div className="section-shell relative pb-24 pt-12 sm:pt-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/explore"
              className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-white"
            >
              <ArrowLeft size={12} />
              Back to explorer
            </Link>
            <div className="flex items-center gap-2">
              <span className="section-label inline-flex items-center gap-2 border-l border-accent bg-accent/[0.06] px-3 py-2">
                <ShieldCheck size={12} />
                Evidence Passport
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Verification receipt
            </h1>
            <p className="mt-1 font-mono text-xs text-muted sm:text-sm">{id}</p>
            <div className="product-network-strip mt-4">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Attestation network · Ethereum Sepolia · chain 11155111
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-medium transition hover:border-white/20"
            >
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-semibold text-background shadow-glow transition hover:opacity-90"
            >
              New verification
            </Link>
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-3xl border border-white/5 bg-card/40" />
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="h-72 animate-pulse rounded-3xl border border-white/5 bg-card/40" />
              <div className="h-72 animate-pulse rounded-3xl border border-white/5 bg-card/40 lg:col-span-2" />
            </div>
            <div className="h-48 animate-pulse rounded-3xl border border-white/5 bg-card/40" />
          </div>
        ) : isError || !data ? (
          <div className="rounded-3xl border border-danger/30 bg-danger/5 px-6 py-14 text-center">
            <p className="text-sm font-medium text-danger">Passport not found</p>
            <p className="mt-2 text-xs text-muted">
              {(error as Error)?.message ||
                'This public ID does not match a stored Evidence Passport.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link href="/explore" className="text-xs font-semibold text-accent hover:underline">
                Open explorer
              </Link>
              <button
                type="button"
                onClick={() => refetch()}
                className="text-xs font-semibold text-muted hover:text-white"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <PassportView passport={data} />
        )}
      </div>
    </div>
  );
}
