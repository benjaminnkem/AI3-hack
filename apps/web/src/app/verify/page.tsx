'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  FileCheck2,
  Image as ImageIcon,
  Link2,
  Network,
  ShieldCheck,
  Sparkles,
  Type,
} from 'lucide-react';
import { VerificationForm, VerificationFormValues } from '@/components/VerificationForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { Reveal, Stagger, StaggerItem, fadeUp } from '@/components/landing/Motion';
import { useVerification } from '@/hooks/useVerification';
import { cn } from '@/lib/utils';

const PIPELINE = [
  {
    icon: Type,
    title: 'Normalize input',
    body: 'Text, URL extraction, or vision transcript from screenshots.',
  },
  {
    icon: FileCheck2,
    title: 'Extract claims',
    body: 'Break the source into 1-5 independently checkable facts.',
  },
  {
    icon: Network,
    title: 'Dual-model review',
    body: 'Kimi and MiniMax investigate in parallel through Gonka.',
  },
  {
    icon: Boxes,
    title: 'Passport + attest',
    body: 'Deterministic Truth Score and integrity roots anchored on Ethereum Sepolia.',
  },
];

const EXAMPLES: {
  label: string;
  inputType: 'text' | 'url';
  input: string;
  hint: string;
}[] = [
  {
    label: 'Policy claim',
    inputType: 'text',
    input:
      'The European Union passed the AI Act in 2024, establishing risk-based rules for artificial intelligence systems.',
    hint: 'Text',
  },
  {
    label: 'Science claim',
    inputType: 'text',
    input:
      'mRNA COVID-19 vaccines were authorized for emergency use in the United States in December 2020.',
    hint: 'Text',
  },
  {
    label: 'News URL',
    inputType: 'url',
    input: 'https://www.reuters.com/',
    hint: 'URL',
  },
];

const INPUT_TYPES = [
  { icon: Type, label: 'Text', detail: 'Claims & paragraphs' },
  { icon: Link2, label: 'URL', detail: 'Articles & posts' },
  { icon: ImageIcon, label: 'Image', detail: 'Screenshots up to 5MB' },
];

export default function VerifyPage() {
  const [formSeed, setFormSeed] = useState(0);
  const [defaults, setDefaults] = useState<Partial<VerificationFormValues>>({
    inputType: 'text',
    input: '',
  });
  const [activeExample, setActiveExample] = useState<string | null>(null);
  const { submit, isVerifying, isError, error } = useVerification();

  const applyExample = (example: (typeof EXAMPLES)[number]) => {
    setActiveExample(example.label);
    setDefaults({ inputType: example.inputType, input: example.input });
    setFormSeed((n) => n + 1);
  };

  return (
    <div className="product-page relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px]">
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
          className="mb-14 max-w-4xl"
        >
          <motion.div variants={fadeUp}>
            <span className="section-label inline-flex items-center gap-2 border-l border-accent bg-accent/[0.06] px-3 py-2">
              <ShieldCheck size={13} />
              Launch App
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="product-page-heading mt-7">
            Verify a claim
          </motion.h1>

          <motion.p variants={fadeUp} className="section-copy mt-7">
            Submit text, a URL, or a screenshot. Mesh extracts factual claims, gathers live
            evidence, runs two independent models, and returns a portable Evidence Passport.
          </motion.p>

          <motion.div variants={fadeUp} className="product-network-strip mt-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Attestation network · Ethereum Sepolia · chain 11155111
          </motion.div>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
            {INPUT_TYPES.map(({ icon: Icon, label, detail }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-muted"
              >
                <Icon size={12} className="text-accent" />
                <span className="font-medium text-white/90">{label}</span>
                <span className="text-muted/80">{detail}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {isVerifying ? (
          <div id="verification-loading" className="mx-auto max-w-4xl scroll-mt-28">
            <LoadingScreen />
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <div className="space-y-5">
              <VerificationForm
                key={formSeed}
                onSubmit={submit}
                loading={isVerifying}
                defaultValues={defaults}
              />

              <div>
                <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => applyExample(example)}
                      className={cn(
                        'rounded-full border px-3.5 py-2 text-xs font-medium transition',
                        activeExample === example.label
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-white',
                      )}
                    >
                      <span className="mr-1.5 text-[10px] uppercase tracking-wide opacity-70">
                        {example.hint}
                      </span>
                      {example.label}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {isError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="rounded-2xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger"
                  >
                    <p className="font-medium">Verification failed</p>
                    <p className="mt-1 text-danger/90">
                      {(error as Error)?.message ||
                        'Check that the API and Gonka credentials are configured.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-5">
              <Reveal>
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 p-6 backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">What you get back</p>
                      <p className="text-xs text-muted">Evidence Passport contents</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {[
                      'Atomic claims with importance weights',
                      'Supporting and opposing evidence links',
                      'Kimi and MiniMax scores side by side',
                      'Deterministic 0-100 Truth Score and verdict',
                      'Gonka response IDs for auditability',
                      'Ethereum Sepolia attestation · chain 11155111',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                        <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-accent" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {PIPELINE.map(({ icon: Icon, title, body }, i) => (
                  <StaggerItem key={title}>
                    <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4 transition hover:border-accent/20">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-card text-accent">
                          <Icon size={15} />
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-accent/80">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <p className="text-sm font-semibold text-white">{title}</p>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-muted">{body}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>

              <Reveal delay={0.1}>
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-xs leading-relaxed text-muted">
                    Mesh is decision-support infrastructure, not a final authority. Results are
                    transparent, multi-model, and independently auditable.
                  </p>
                  <Link
                    href="/about"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition hover:underline"
                  >
                    How Mesh works
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
