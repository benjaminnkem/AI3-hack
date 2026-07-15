'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  FileCheck2,
  GitBranch,
  Network,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
  Link2,
  Image as ImageIcon,
} from 'lucide-react';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { Reveal, Stagger, StaggerItem, fadeUp } from '@/components/landing/Motion';

const STEPS = [
  {
    icon: Type,
    title: 'Input resolution',
    body: 'Text passes through. URLs are extracted into readable content. Images become a neutral visual transcript via Kimi vision.',
  },
  {
    icon: FileCheck2,
    title: 'Claim extraction',
    body: 'A Gonka-routed model isolates 1-5 independently verifiable factual claims and drops pure opinion or satire without facts.',
  },
  {
    icon: Search,
    title: 'Live evidence',
    body: 'Tavily searches for supporting and opposing sources per claim, with quality, relevance, and domain coverage tracked.',
  },
  {
    icon: Network,
    title: 'Multi-model panel',
    body: 'Kimi-K2.6 and MiniMax-M2.7 score the same claim set independently through Gonka Router. Neither sees the other first.',
  },
  {
    icon: Scale,
    title: 'Consensus engine',
    body: 'A deterministic formula blends evidence balance, model means, disagreement, and adversarial penalties into a 0-100 Truth Score.',
  },
  {
    icon: Boxes,
    title: 'Passport + attestation',
    body: 'Mesh builds a canonical Evidence Passport, hashes integrity roots with keccak256, and anchors them on Ethereum Sepolia.',
  },
];

const PRINCIPLES = [
  {
    icon: GitBranch,
    title: 'Disagreement stays visible',
    body: 'Mesh never forces a fake consensus. When models diverge, the passport shows both sides and adjusts confidence.',
  },
  {
    icon: Sparkles,
    title: 'Scores are computed, not invented',
    body: 'Truth Score bands come from application code. A narrative summary may explain the result, but it cannot rewrite numbers.',
  },
  {
    icon: ShieldCheck,
    title: 'Integrity without storing secrets',
    body: 'Only compact hashes and metadata go on-chain. Full claims and screenshots stay off-chain and auditable by hash.',
  },
];

const INPUTS = [
  { icon: Type, label: 'Text', detail: 'Claims, paragraphs, quotes' },
  { icon: Link2, label: 'URL', detail: 'Articles and social posts' },
  { icon: ImageIcon, label: 'Image', detail: 'Screenshots, PNG/JPEG/WebP' },
];

const VERDICTS = [
  { label: 'Supported', range: '70-100', color: '#22e59a' },
  { label: 'Unverified', range: '50-69', color: '#7fe37f' },
  { label: 'Misleading', range: '25-49', color: '#f0c23a' },
  { label: 'Contradicted', range: '0-24', color: '#f0603a' },
];

export default function AboutPage() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]">
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
          className="mb-14 max-w-2xl"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent shadow-[0_0_24px_-8px_rgba(34,229,154,0.55)]">
              <ShieldCheck size={13} />
              Protocol overview
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            How Mesh works
          </motion.h1>

          <motion.p variants={fadeUp} className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Mesh turns a digital claim into a portable Evidence Passport: multi-model investigation,
            live evidence, a transparent Truth Score, and a tamper-evident on-chain receipt.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
            >
              Launch App
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Explore passports
            </Link>
          </motion.div>
        </motion.div>

        <section className="mb-16">
          <Reveal className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Accepted inputs
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What you can submit</h2>
          </Reveal>
          <Stagger className="grid gap-4 sm:grid-cols-3">
            {INPUTS.map(({ icon: Icon, label, detail }) => (
              <StaggerItem key={label}>
                <div className="h-full rounded-3xl border border-white/8 bg-card/60 p-5 backdrop-blur-xl">
                  <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
                    <Icon size={18} />
                  </span>
                  <p className="font-semibold">{label}</p>
                  <p className="mt-1 text-sm text-muted">{detail}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section className="mb-16">
          <Reveal className="mb-8 max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Pipeline
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Six stages from claim to passport
            </h2>
            <p className="mt-3 text-muted leading-relaxed">
              Every verification follows the same path so results stay comparable, explainable, and
              independently checkable.
            </p>
          </Reveal>

          <Stagger className="grid gap-4 md:grid-cols-2">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.title}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="group relative h-full overflow-hidden rounded-3xl border border-white/8 bg-card/60 p-6 transition hover:border-accent/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 opacity-0 transition duration-500 group-hover:from-accent/[0.05] group-hover:opacity-100" />
                    <div className="relative flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-accent">
                          <Icon size={18} />
                        </span>
                        <span className="font-mono text-[11px] text-accent/70">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </section>

        <section className="mb-16">
          <div className="grid items-start gap-8 lg:grid-cols-2">
            <Reveal>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Design principles
              </p>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Built for auditability, not authority
              </h2>
              <p className="mt-3 text-muted leading-relaxed">
                Mesh is decision-support infrastructure. It makes investigations reusable and
                tamper-evident. It does not replace experts or claim perfect truth.
              </p>
              <div className="mt-6 space-y-3">
                {PRINCIPLES.map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Icon size={15} className="text-accent" />
                      <p className="text-sm font-semibold">{title}</p>
                    </div>
                    <p className="text-xs leading-relaxed text-muted">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Verdict bands
                </p>
                <h3 className="text-xl font-semibold tracking-tight">How Truth Score maps</h3>
                <p className="mt-2 text-sm text-muted">
                  Overall scores are importance-weighted across claims, then rounded to whole numbers.
                </p>
                <div className="mt-6 space-y-3">
                  {VERDICTS.map((v) => (
                    <div
                      key={v.label}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/20 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: v.color, boxShadow: `0 0 12px ${v.color}66` }}
                        />
                        <span className="text-sm font-medium">{v.label}</span>
                      </div>
                      <span className="font-mono text-xs tabular-nums text-muted">{v.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mb-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent/15 via-card to-card p-8 sm:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <h2 className="text-3xl font-bold tracking-tight">Ready to run a verification?</h2>
                  <p className="mt-4 text-muted leading-relaxed">
                    Submit a claim and get a public Evidence Passport with model outputs, evidence,
                    Gonka IDs, and optional on-chain attestation.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/verify"
                    className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90"
                  >
                    Verify a claim
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/20"
                  >
                    Browse explorer
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
