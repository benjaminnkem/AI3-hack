'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Boxes,
  FileCheck2,
  Network,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { verify, getHistory } from '@/lib/api';
import { VerificationForm, VerificationFormValues } from '@/components/VerificationForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { PassportPreview } from '@/components/landing/PassportPreview';
import { Reveal, Stagger, StaggerItem, easeOutExpo, fadeUp } from '@/components/landing/Motion';
import { cn, scoreMeta } from '@/lib/utils';

const FEATURES = [
  {
    icon: Network,
    title: 'Multi-model consensus',
    body: 'Kimi and MiniMax score every claim independently through Gonka Router. Agreement is measured. Disagreement is preserved.',
  },
  {
    icon: Search,
    title: 'Live web evidence',
    body: 'Tavily retrieves supporting and opposing sources in real time, not stale model memory alone.',
  },
  {
    icon: FileCheck2,
    title: 'Evidence Passport',
    body: 'A portable record of claims, evidence, model outputs, Gonka IDs, and a deterministic Truth Score.',
  },
  {
    icon: Boxes,
    title: 'On-chain attestation',
    body: 'Compact hashes anchor the passport on Ethereum Sepolia so anyone can verify integrity later.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Submit',
    body: 'Paste text, a URL, or upload a screenshot. Mesh normalizes the input without putting private content on-chain.',
  },
  {
    step: '02',
    title: 'Extract',
    body: 'Atomic factual claims are isolated. Opinions and satire without facts are filtered out.',
  },
  {
    step: '03',
    title: 'Investigate',
    body: 'Live evidence is gathered, then Kimi and MiniMax investigate independently via Gonka.',
  },
  {
    step: '04',
    title: 'Attest',
    body: 'A Truth Score is computed, a passport is minted, and integrity roots are published on Sepolia.',
  },
];

const STATS = [
  { label: 'Independent models', value: '2' },
  { label: 'Evidence layer', value: 'Live' },
  { label: 'Network', value: 'Sepolia' },
  { label: 'Audit trail', value: 'Gonka IDs' },
];

export default function Home() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: verify,
    onSuccess: (data) => {
      router.push(`/passport/${data.publicId}`);
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });

  const handleSubmit = (values: VerificationFormValues) => {
    mutation.mutate({ inputType: values.inputType, input: values.input });
  };

  return (
    <div className="overflow-x-hidden">
      <section className="relative isolate">
        <HeroBackdrop />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-14 sm:pt-20 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
                }}
              >
                <motion.div variants={fadeUp} className="mb-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent shadow-[0_0_24px_-8px_rgba(34,229,154,0.55)]">
                    <ShieldCheck size={13} />
                    Multi-model · Live evidence · On-chain receipt
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
                >
                  Every digital claim deserves a{' '}
                  <span className="relative inline-block text-accent">
                    verifiable
                    <motion.span
                      className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-accent/70"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.7, duration: 0.7, ease: easeOutExpo }}
                    />
                  </span>{' '}
                  Evidence Passport.
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
                >
                  Mesh breaks claims into atomic facts, cross-checks them with independent AI models,
                  surfaces disagreement, and seals a tamper-evident passport on Ethereum Sepolia.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#verify"
                    className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
                  >
                    Start verifying
                    <ArrowRight size={16} />
                  </a>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06]"
                  >
                    Explore passports
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-muted"
                >
                  {['Gonka Router', 'Kimi + MiniMax', 'Tavily evidence', 'Keccak integrity'].map(
                    (item) => (
                      <span key={item} className="inline-flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent/80" />
                        {item}
                      </span>
                    ),
                  )}
                </motion.div>
              </motion.div>
            </div>

            <div className="relative">
              <PassportPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-y border-border/60 bg-white/[0.015]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05} className="px-6 py-7 text-center sm:text-left">
              <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="verify" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20 lg:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Try it now
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Verify a claim in one pass
            </h2>
            <p className="mt-4 max-w-md text-muted leading-relaxed">
              Submit text, a URL, or an image. Mesh returns an Evidence Passport with scores, sources,
              model disagreement, and an optional on-chain receipt.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Atomic claim extraction',
                'Supporting & opposing evidence',
                'Independent dual-model review',
                'Deterministic 0-100 Truth Score',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Zap size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            {mutation.isPending ? (
              <div className="rounded-3xl border border-white/10 bg-card/70 p-6 backdrop-blur-xl">
                <LoadingScreen />
              </div>
            ) : (
              <VerificationForm onSubmit={handleSubmit} loading={mutation.isPending} />
            )}
            {mutation.isError && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger"
              >
                Verification failed. Check that the API and Gonka credentials are configured.
              </motion.div>
            )}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
        <Reveal className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Why Mesh
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Not another opaque truth score
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Centralized checkers hand you one number. Mesh shows the investigation: models, evidence,
            uncertainty, and a cryptographic receipt you can re-check.
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className="group relative h-full overflow-hidden rounded-3xl border border-white/8 bg-card/60 p-6 transition hover:border-accent/25"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-transparent to-accent/0 opacity-0 transition duration-500 group-hover:from-accent/[0.06] group-hover:opacity-100" />
                <div className="relative">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
                    <Icon size={20} />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{body}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="relative border-y border-border/60 bg-white/[0.015] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Pipeline
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From claim to passport in four stages
            </h2>
          </Reveal>

          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((item, i) => (
              <StaggerItem key={item.step}>
                <div className="relative h-full rounded-3xl border border-white/8 bg-background/50 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="font-mono text-sm text-accent">{item.step}</span>
                    {i < STEPS.length - 1 && (
                      <ArrowRight size={14} className="hidden text-muted/40 xl:block" />
                    )}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Transparency first
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Disagreement is a feature, not a bug
            </h2>
            <p className="mt-4 text-muted leading-relaxed">
              Mesh never collapses two models into a fake consensus. You see each investigator&apos;s
              score, reasoning, and where they diverge, plus adversarial challenges that stress-test
              the leading conclusion.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Scale, title: 'Deterministic scoring', body: 'Truth Score is computed in code, not invented by a final LLM.' },
                { icon: Sparkles, title: 'Adversarial review', body: 'A dedicated pass hunts weak sources, stale data, and missing context.' },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/8 bg-card/50 p-4"
                >
                  <Icon size={16} className="mb-3 text-accent" />
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 sm:p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium">Model panel</p>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-muted">
                  Parallel
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Kimi-K2.6', role: 'Investigator + vision', score: 87, bar: 'bg-accent' },
                  { name: 'MiniMax-M2.7', role: 'Independent investigator', score: 81, bar: 'bg-cyan-300' },
                ].map((model, i) => (
                  <div key={model.name} className="rounded-2xl border border-white/5 bg-black/20 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{model.name}</p>
                        <p className="text-xs text-muted">{model.role}</p>
                      </div>
                      <p className="text-xl font-bold tabular-nums">{model.score}</p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className={cn('h-full rounded-full', model.bar)}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${model.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.15 + i * 0.12, ease: easeOutExpo }}
                      />
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-accent">Agreement window</p>
                  <p className="mt-1 text-sm text-muted">
                    Δ 6 points · disagreement preserved in passport · confidence adjusted accordingly
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:pb-28">
        <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Activity size={16} className="text-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Live registry
              </p>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Recent passports</h2>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm text-accent transition hover:underline"
          >
            Open explorer
            <ArrowRight size={14} />
          </Link>
        </Reveal>

        {historyLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-3xl border border-white/5 bg-card/40"
              />
            ))}
          </div>
        ) : !history || history.length === 0 ? (
          <Reveal>
            <div className="rounded-3xl border border-dashed border-white/10 bg-card/30 px-6 py-14 text-center">
              <p className="text-sm text-muted">No verifications yet. Be the first to mint a passport.</p>
              <a
                href="#verify"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
              >
                Verify a claim
                <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 3).map((item) => {
              const score = item.truthScore != null ? Math.round(item.truthScore) : null;
              const meta = score != null ? scoreMeta(score) : null;
              return (
                <StaggerItem key={item.id}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="flex h-full min-h-[12.5rem] flex-col justify-between rounded-3xl border border-white/8 bg-card/60 p-5 transition hover:border-accent/25"
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-muted">
                          {item.inputType}
                        </span>
                        <span className="text-[11px] text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {score != null && meta ? (
                        <div className="mb-3 flex items-end gap-2">
                          <span className="text-3xl font-bold tabular-nums" style={{ color: meta.color }}>
                            {score}
                          </span>
                          <span className="mb-1 text-xs text-muted">/ 100 · {meta.label}</span>
                        </div>
                      ) : (
                        <p className="mb-3 text-sm capitalize text-muted">Status: {item.status}</p>
                      )}
                      <p className="text-sm leading-relaxed text-muted">
                        {item.status === 'completed' && score != null
                          ? 'Evidence Passport registered and available for public audit.'
                          : `Verification is currently ${item.status}.`}
                      </p>
                    </div>
                    {item.passport?.publicId && (
                      <Link
                        href={`/passport/${item.passport.publicId}`}
                        className="mt-5 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-accent transition hover:underline"
                      >
                        View passport
                        <ArrowRight size={12} />
                      </Link>
                    )}
                  </motion.div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/15 via-card to-card p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ship verification as infrastructure
                </h2>
                <p className="mt-4 text-muted leading-relaxed">
                  Use the REST API and embeddable badge to attach Evidence Passports to articles,
                  dashboards, and agent workflows, without trusting a black box.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
                >
                  Launch App
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
