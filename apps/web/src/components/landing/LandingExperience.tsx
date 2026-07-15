'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Bot,
  Braces,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Globe2,
  MessageCircle,
  Network,
  Newspaper,
  Radio,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroBackdrop } from './HeroBackdrop';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Reveal, Stagger, StaggerItem, easeOutExpo } from './Motion';
import { VerificationPipeline } from './VerificationPipeline';

const TELEGRAM_URL = 'https://t.me/mesh_passport_bot';

const PROTOCOL_ITEMS = [
  'Multi-model inference',
  'Live web evidence',
  'Transparent disagreement',
  'Gonka Request IDs',
  'On-chain attestations',
  'Public auditability',
];

const PROBLEMS = [
  [
    '01',
    'Platform lock-in',
    'A useful investigation disappears inside the platform that published it.',
  ],
  [
    '02',
    'Repeated work',
    'The same recycled claim forces every community to begin again from zero.',
  ],
  [
    '03',
    'Hidden uncertainty',
    'Single-model answers compress disagreement and source gaps into false confidence.',
  ],
  [
    '04',
    'Mutable records',
    'Verdicts and evidence can change without leaving a public integrity trail.',
  ],
];

const HERO_TABS = ['Consensus', 'Evidence', 'Attestation'] as const;
type HeroTab = (typeof HERO_TABS)[number];

function HeroProductPreview() {
  const [tab, setTab] = useState<HeroTab>('Consensus');
  return (
    <motion.div
      data-hero-preview
      initial={{ opacity: 0, y: 48, rotateX: 7 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: easeOutExpo }}
      className="relative mx-auto mt-16 max-w-5xl perspective-[1400px] sm:mt-20"
    >
      <div className="absolute -inset-10 bg-accent/[0.06] blur-3xl" aria-hidden />
      <div className="technical-panel relative overflow-hidden bg-card/90 shadow-[0_35px_100px_-55px_rgba(34,229,154,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border border-accent/20 bg-accent/10 text-accent">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="text-xs font-semibold">Evidence Passport</p>
              <p className="font-mono text-[10px] text-muted">mesh_7f3a91d4 · version 1</p>
            </div>
          </div>
          <div
            className="flex gap-1 border border-border bg-background/70 p-1"
            role="tablist"
            aria-label="Passport preview"
          >
            {HERO_TABS.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                onClick={() => setTab(item)}
                className={cn(
                  'relative min-h-9 px-3 text-[11px] font-medium transition',
                  tab === item ? 'text-background' : 'text-muted hover:text-white',
                )}
              >
                {tab === item && (
                  <motion.span
                    layoutId="hero-tab"
                    className="absolute inset-0 bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-[390px] lg:grid-cols-[0.72fr_1.28fr]">
          <div className="border-b border-border p-6 lg:border-b-0 lg:border-r sm:p-8">
            <p className="section-label">Confidence assessment</p>
            <div className="mt-8 flex items-end gap-2">
              <span className="text-7xl font-semibold tracking-[-0.08em]">84</span>
              <span className="pb-2 text-lg text-muted">/100</span>
            </div>
            <span className="mt-4 inline-flex items-center gap-2 border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
              <CheckCircle2 size={13} />
              Supported
            </span>
            <p className="mt-8 text-sm leading-7 text-muted">
              Available evidence substantially supports the claim, with a narrow model spread and
              one unresolved context note.
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="p-6 sm:p-8"
            >
              {tab === 'Consensus' && (
                <div className="grid h-full content-center gap-4 sm:grid-cols-2">
                  {[
                    ['Kimi-K2.6', '87', 'SUPPORTED'],
                    ['MiniMax-M2.7', '81', 'SUPPORTED'],
                  ].map(([model, score, verdict]) => (
                    <div key={model} className="border border-border bg-surface/60 p-5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted">{model}</span>
                        <Radio size={13} className="text-accent" />
                      </div>
                      <p className="mt-8 text-4xl font-semibold">{score}</p>
                      <p className="mt-2 text-[10px] font-semibold tracking-[0.16em] text-accent">
                        {verdict}
                      </p>
                    </div>
                  ))}
                  <div className="sm:col-span-2 border border-warn/25 bg-warn/5 p-4 text-xs leading-6 text-muted">
                    <span className="mr-2 text-warn">△</span>Disagreement preserved: models differ
                    by 6 points on source recency.
                  </div>
                </div>
              )}
              {tab === 'Evidence' && (
                <div className="space-y-3">
                  {[
                    ['Supporting', 'Official publication confirms the underlying event.', '0.94'],
                    ['Supporting', 'Independent reporting matches the date and scope.', '0.88'],
                    ['Opposing', 'Earlier coverage omitted the final amendment.', '0.72'],
                  ].map(([direction, text, relevance], i) => (
                    <div
                      key={`${direction}-${i}`}
                      className="grid gap-3 border-b border-border py-4 sm:grid-cols-[100px_1fr_auto]"
                    >
                      <span
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-wider',
                          direction === 'Opposing' ? 'text-warn' : 'text-accent',
                        )}
                      >
                        {direction}
                      </span>
                      <p className="text-xs leading-6 text-muted">{text}</p>
                      <span className="font-mono text-[10px] text-white/60">rel {relevance}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'Attestation' && (
                <div className="space-y-5 font-mono text-[11px]">
                  {[
                    ['claimHash', '0x7f3a…c91e'],
                    ['evidenceRoot', '0xb881…19a4'],
                    ['passportHash', '0x4da7…e12b'],
                    ['chainId', '11155111'],
                    ['transaction', '0x9c12…38af'],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-5 border-b border-border pb-4"
                    >
                      <span className="text-muted">{label}</span>
                      <span className="text-white/80">{value}</span>
                    </div>
                  ))}
                  <div className="inline-flex items-center gap-2 text-accent">
                    <ShieldCheck size={14} />
                    Integrity match confirmed
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {/* Replace with /public/images/Mesh/verification-preview.webp when the final product capture is ready. */}
      <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-muted/60">
        Live product preview · screenshot-ready frame
      </p>
    </motion.div>
  );
}

const USE_CASES = [
  {
    id: 'people',
    label: 'People',
    icon: UserRound,
    title: 'A clearer way to question what you receive.',
    body: 'Inspect claims, sources, uncertainty, and the public receipt before resharing.',
  },
  {
    id: 'newsrooms',
    label: 'Newsrooms',
    icon: Newspaper,
    title: 'A reusable investigation trail for reporting.',
    body: 'Give journalists and researchers one artifact containing sources, dates, model reasoning, and open questions.',
  },
  {
    id: 'platforms',
    label: 'Platforms',
    icon: Globe2,
    title: 'Portable context for every surface.',
    body: 'Public pages and embeddable badges let communities reference the same evidence record.',
  },
  {
    id: 'agents',
    label: 'AI agents',
    icon: Bot,
    title: 'Agent-readable trust without duplicate work.',
    body: 'Applications can consume a passport through the REST API and inspect provenance before acting.',
  },
];

export function LandingExperience() {
  const root = useRef<HTMLDivElement>(null);
  const [useCase, setUseCase] = useState(USE_CASES[0]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.from('[data-hero-line]', {
          y: 70,
          opacity: 0,
          duration: 1,
          stagger: 0.09,
          ease: 'power4.out',
          delay: 0.1,
        });
        gsap.to('[data-parallax="slow"]', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-hero]',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
        gsap.to('[data-network-orbit]', {
          rotate: 24,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-network-section]',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }, root);
      return () => ctx.revert();
    });
    return () => media.revert();
  }, []);

  return (
    <div ref={root} className="overflow-clip">
      <section
        data-hero
        id="product"
        className="relative isolate min-h-[calc(100svh-72px)] scroll-mt-20 pb-20 pt-20 sm:pt-28 lg:pb-32"
      >
        <HeroBackdrop />
        <div data-parallax="slow" className="section-shell relative text-center">
          <div
            data-hero-line
            className="mx-auto inline-flex items-center gap-2 border border-accent/20 bg-accent/[0.07] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            Decentralized evidence infrastructure
          </div>
          <h1 className="hero-title mx-auto mt-8 max-w-5xl">
            <span data-hero-line className="block">
              Every digital claim deserves
            </span>
            <span data-hero-line className="block text-accent">
              a verifiable evidence passport.
            </span>
          </h1>
          <p
            data-hero-line
            className="mx-auto mt-8 max-w-2xl text-base leading-8 text-muted sm:text-lg"
          >
            Mesh combines live evidence retrieval, independent AI investigators through Gonka
            Router, transparent disagreement, and tamper-evident attestations.
          </p>
          <div
            data-hero-line
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href="/verify" data-cursor="VERIFY" className="button-primary w-full sm:w-auto">
              Verify a claim <ArrowRight size={16} />
            </Link>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="OPEN"
              className="button-secondary w-full sm:w-auto"
            >
              <MessageCircle size={16} />
              Open Telegram Bot <ExternalLink size={13} />
            </a>
          </div>
          <HeroProductPreview />
        </div>
      </section>

      <div className="border-y border-border bg-surface/40" aria-label="Protocol capabilities">
        <div className="section-shell flex flex-wrap justify-center gap-x-8 gap-y-3 py-5 lg:justify-between">
          {PROTOCOL_ITEMS.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted"
            >
              <span className="h-1 w-1 rounded-full bg-accent" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="section-shell py-24 lg:py-36">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <Reveal className="lg:sticky lg:top-28 lg:h-fit">
            <p className="section-label">01 / The broken loop</p>
            <h2 className="display-section mt-5">A verdict without provenance cannot travel.</h2>
            <p className="section-copy mt-6">
              Most fact-checks are pages. Mesh turns an investigation into an independently
              auditable object.
            </p>
          </Reveal>
          <div className="border-t border-border">
            {PROBLEMS.map(([index, title, body]) => (
              <Reveal
                key={title}
                className="grid gap-4 border-b border-border py-8 sm:grid-cols-[52px_0.7fr_1fr] sm:items-start"
              >
                <span className="font-mono text-xs text-accent">{index}</span>
                <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                <p className="text-sm leading-7 text-muted">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <VerificationPipeline />

      <section
        data-network-section
        className="relative border-y border-border bg-surface/35 py-24 lg:py-36"
      >
        <div className="section-shell grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="section-label">03 / Multi-model consensus</p>
            <h2 className="display-section mt-5">Disagreement is a signal, not a defect.</h2>
            <p className="section-copy mt-6">
              Kimi and MiniMax investigate independently. An adversarial pass challenges the leading
              conclusion. Mesh preserves the spread, then applies deterministic scoring to the
              available evidence.
            </p>
            <div className="mt-8 border-l border-warn/40 pl-5 text-sm leading-7 text-muted">
              <span className="text-warn">Truth Score is not absolute truth.</span> It is a
              transparent confidence assessment built from evidence balance, source quality, model
              outputs, and unresolved challenges.
            </div>
          </Reveal>
          <Reveal className="relative mx-auto aspect-square w-full max-w-lg">
            <div
              data-network-orbit
              className="absolute inset-[12%] rounded-full border border-dashed border-accent/20"
              aria-hidden
            />
            <div className="absolute inset-[28%] flex flex-col items-center justify-center rounded-full border border-accent/40 bg-background shadow-glow">
              <Network className="text-accent" size={24} />
              <p className="mt-3 text-sm font-semibold">Consensus engine</p>
              <p className="mt-1 font-mono text-[10px] text-muted">84 / 100</p>
            </div>
            {[
              ['Kimi', 'top-0 left-1/2 -translate-x-1/2'],
              ['MiniMax', 'bottom-5 left-5'],
              ['Adversarial', 'bottom-5 right-5'],
            ].map(([label, pos], index) => (
              <div
                key={label}
                className={cn(
                  'absolute flex h-24 w-24 flex-col items-center justify-center border bg-card text-center',
                  pos,
                  index === 2 ? 'border-warn/30' : 'border-accent/25',
                )}
              >
                <span
                  className={cn('h-2 w-2 rounded-full', index === 2 ? 'bg-warn' : 'bg-accent')}
                />
                <span className="mt-2 text-xs font-semibold">{label}</span>
                <span className="mt-1 font-mono text-[9px] text-muted">
                  {index === 0 ? '87' : index === 1 ? '81' : '1 challenge'}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section id="passport" className="section-shell scroll-mt-24 py-24 lg:py-36">
        <Reveal className="mb-14 max-w-3xl">
          <p className="section-label">04 / Evidence Passport</p>
          <h2 className="display-section mt-5">Inspect the investigation, not just the answer.</h2>
          <p className="section-copy mt-6">
            Every important input, source, model response, request identifier, score, and integrity
            root stays connected in one public artifact.
          </p>
        </Reveal>
        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Reveal className="technical-panel overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-label">Passport mesh_7f3a91d4</p>
                <p className="mt-2 text-sm text-white">“The policy entered into force in 2024.”</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-semibold tracking-tight">84</span>
                <span className="pb-1 text-sm text-muted">SUPPORTED</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-b border-border p-5 md:border-b-0 md:border-r">
                <p className="section-label">Atomic claims</p>
                {[
                  'Legislation was formally adopted.',
                  'Risk-based obligations are defined.',
                  'Implementation phases extend beyond 2024.',
                ].map((claim, i) => (
                  <div
                    key={claim}
                    className="mt-4 flex gap-3 border-b border-border/60 pb-4 text-sm leading-6 text-muted"
                  >
                    <span className="font-mono text-[10px] text-accent">0{i + 1}</span>
                    {claim}
                  </div>
                ))}
              </div>
              <div className="p-5">
                <p className="section-label">Model panel</p>
                {[
                  ['Kimi-K2.6', '87', 'msg_01J…7P'],
                  ['MiniMax-M2.7', '81', 'msg_01J…CX'],
                ].map(([model, score, id]) => (
                  <div
                    key={model}
                    className="mt-4 grid grid-cols-[1fr_auto] border border-border bg-surface/50 p-4"
                  >
                    <div>
                      <p className="text-xs font-semibold">{model}</p>
                      <p className="mt-1 font-mono text-[9px] text-muted">{id}</p>
                    </div>
                    <span className="text-2xl font-semibold text-accent">{score}</span>
                  </div>
                ))}
                <div className="mt-4 border border-warn/20 bg-warn/5 p-4 text-xs leading-6 text-muted">
                  Disagreement: source recency changes the confidence spread by 6 points.
                </div>
              </div>
            </div>
            <div className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
              {[
                ['claimHash', '0x7f3a…c91e'],
                ['evidenceRoot', '0xb881…19a4'],
                ['passportHash', '0x4da7…e12b'],
              ].map(([label, value]) => (
                <div key={label} className="bg-card p-4 font-mono text-[10px]">
                  <p className="text-muted">{label}</p>
                  <p className="mt-2 text-white/70">{value}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <div className="grid gap-5">
            {/* Replace with /public/images/Mesh/evidence-passport.webp when the approved screenshot is available. */}
            <ImagePlaceholder
              label="Evidence Passport capture"
              path="/images/Mesh/evidence-passport.webp"
            />
            <Reveal className="technical-panel p-5 font-mono text-[10px]">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted">chain</span>
                <span>Ethereum Sepolia</span>
              </div>
              <div className="mt-3 flex justify-between border-b border-border pb-3">
                <span className="text-muted">version</span>
                <span>1</span>
              </div>
              <div className="mt-3 flex justify-between">
                <span className="text-muted">issued</span>
                <span>2026-07-15T18:42Z</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="protocol"
        className="relative border-y border-border bg-card/35 py-24 lg:py-36 scroll-mt-24"
      >
        <div className="section-shell grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <Reveal>
            <p className="section-label">05 / Tamper-evident receipt</p>
            <h2 className="display-section mt-5">
              The evidence stays off-chain. Its integrity does not.
            </h2>
            <p className="section-copy mt-6">
              Mesh publishes compact hashes and attestation metadata to Ethereum Sepolia. It does
              not permanently store the full claim, screenshot, or evidence on-chain.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                ['Private content', 'remains off-chain'],
                ['Any modification', 'changes the hash'],
                ['Passport versions', 'create an audit trail'],
              ].map(([label, value]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-border pb-4 text-sm"
                >
                  <span className="text-muted">{label}</span>
                  <span className="text-white">{value}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="technical-panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-accent/25 bg-accent/10 text-accent">
                  <Fingerprint size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Attestation confirmed</p>
                  <p className="font-mono text-[9px] text-muted">
                    Ethereum Sepolia · chain 11155111
                  </p>
                </div>
              </div>
              <CheckCircle2 size={18} className="text-accent" />
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              {[
                ['claimHash', '0x7f3a5e91d4b2…c91e'],
                ['evidenceMerkleRoot', '0xb881f7a024cc…19a4'],
                ['passportHash', '0x4da7129a0bd8…e12b'],
                ['truthScore', '84'],
                ['verificationVersion', '1'],
                ['transactionHash', '0x9c12d6ef83a1…38af'],
              ].map(([label, value], i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-5 border-b border-border pb-4 font-mono text-[10px]"
                >
                  <span className="text-muted">{label}</span>
                  <span className="flex items-center gap-2 text-white/75">
                    {value}
                    <Copy size={11} className="text-muted" />
                  </span>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-shell py-24 lg:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <Reveal className="order-2 lg:order-1">
            <div className="technical-panel max-w-md overflow-hidden">
              <div className="border-b border-border p-4 font-mono text-[10px] text-muted">
                mesh_passport_bot · online
              </div>
              <div className="space-y-4 p-5">
                <div className="ml-auto max-w-[85%] bg-accent p-3 text-xs leading-5 text-background">
                  Verify: “This policy took effect worldwide in 2024.”
                </div>
                <div className="max-w-[90%] border border-border bg-surface p-4 text-xs leading-6 text-muted">
                  <span className="mb-2 block font-semibold text-white">
                    Mesh verification · 63/100
                  </span>
                  Mixed evidence. The policy entered force in one region, but the worldwide framing
                  is misleading.
                </div>
              </div>
            </div>
            {/* Replace with /public/images/Mesh/telegram-bot.webp when the final bot screenshot is available. */}
            <div className="mt-4 max-w-md">
              <ImagePlaceholder
                label="Telegram bot capture"
                path="/images/Mesh/telegram-bot.webp"
              />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <p className="section-label">06 / Verification in the conversation</p>
            <h2 className="display-section mt-5">Forward the claim. Keep the receipt.</h2>
            <p className="section-copy mt-6">
              Paste or forward suspicious content to the Telegram bot and receive a compact Mesh
              verification response with a shareable passport.
            </p>
            <div className="mt-7 space-y-3 font-mono text-[11px] text-muted">
              <p>/verify &lt;claim&gt;</p>
              <p>/passport &lt;public-id&gt;</p>
            </div>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="OPEN"
              className="button-primary mt-8"
            >
              Open Telegram Bot <ExternalLink size={14} />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-surface/30 py-24 lg:py-36">
        <div className="section-shell">
          <Reveal className="mb-12 max-w-2xl">
            <p className="section-label">07 / Human and machine use</p>
            <h2 className="display-section mt-5">One protocol. Different decisions.</h2>
          </Reveal>
          <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
            <div className="border-y border-border">
              {USE_CASES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setUseCase(item)}
                  className={cn(
                    'flex min-h-16 w-full items-center gap-4 border-b border-border px-1 text-left text-sm transition last:border-0',
                    useCase.id === item.id ? 'text-accent' : 'text-muted hover:text-white',
                  )}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  <ArrowRight size={13} className="ml-auto" />
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={useCase.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="technical-panel min-h-72 p-7 sm:p-10"
              >
                <span className="flex h-12 w-12 items-center justify-center border border-accent/25 bg-accent/10 text-accent">
                  <useCase.icon size={20} />
                </span>
                <h3 className="mt-10 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  {useCase.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-7 text-muted">{useCase.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="section-shell py-24 lg:py-36">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="section-label">08 / Reusable verification</p>
          <h2 className="display-section mt-5">Investigate once. Reference everywhere.</h2>
          <p className="section-copy mx-auto mt-6">
            A repeated claim should point back to one versioned Evidence Passport—not trigger six
            disconnected investigations.
          </p>
        </Reveal>
        <Reveal className="relative mx-auto mt-16 min-h-[420px] max-w-5xl overflow-hidden border border-border bg-card/35 p-6 sm:p-10">
          <div className="mesh-grid absolute inset-0 opacity-45" aria-hidden />
          <div className="relative z-10 flex min-h-[330px] items-center justify-center">
            <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border border-accent/40 bg-background shadow-glow">
              <FileCheck2 size={24} className="text-accent" />
              <p className="mt-3 text-xs font-semibold">One Passport</p>
              <p className="mt-1 font-mono text-[9px] text-muted">mesh_7f3a91d4</p>
            </div>
            {[
              ['X', 'left-4 top-8'],
              ['Telegram', 'right-4 top-8'],
              ['WhatsApp', 'left-2 bottom-8'],
              ['Discord', 'right-2 bottom-8'],
              ['News site', 'left-1/2 top-0 -translate-x-1/2'],
              ['Agent', 'left-1/2 bottom-0 -translate-x-1/2'],
            ].map(([label, position]) => (
              <div
                key={label}
                className={cn(
                  'absolute border border-border bg-background px-3 py-2 font-mono text-[9px] text-muted sm:px-4',
                  position,
                )}
              >
                {label}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="border-y border-border bg-card/30 py-24 lg:py-36">
        <div className="section-shell grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <Reveal>
            <p className="section-label">09 / Protocol surface</p>
            <h2 className="display-section mt-5">
              Trust infrastructure for applications and agents.
            </h2>
            <p className="section-copy mt-6">
              The public REST API, verification pages, and embeddable badge are current MVP
              surfaces. SDK and MCP support are planned integration layers.
            </p>
            <Link href="/about" className="button-secondary mt-8">
              Explore the protocol <ArrowRight size={15} />
            </Link>
          </Reveal>
          <Stagger className="grid gap-px bg-border sm:grid-cols-2">
            {[
              [Braces, 'REST API', 'Available'],
              [Globe2, 'Public pages', 'Available'],
              [WalletCards, 'Embeddable badge', 'Available'],
              [MessageCircle, 'Telegram bot', 'Available'],
              [Code2, 'TypeScript SDK', 'Planned'],
              [Bot, 'MCP server', 'Planned'],
            ].map(([Icon, title, status]) => {
              const ItemIcon = Icon as typeof Braces;
              return (
                <StaggerItem key={String(title)} className="bg-background p-5">
                  <ItemIcon size={17} className="text-accent" />
                  <p className="mt-6 text-sm font-semibold">{String(title)}</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-muted">
                    {String(status)}
                  </p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="section-shell py-24 lg:py-40">
        <Reveal className="relative overflow-hidden border border-accent/25 bg-accent/[0.06] px-6 py-20 text-center sm:px-12 lg:py-28">
          <div className="mesh-grid absolute inset-0 opacity-50" aria-hidden />
          <Sparkles className="relative mx-auto text-accent" size={24} />
          <h2 className="relative mx-auto mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Do not trust the claim. Verify the evidence.
          </h2>
          <p className="relative mx-auto mt-6 max-w-xl text-sm leading-7 text-muted">
            Create a public, evidence-backed, tamper-evident record that another person or agent can
            inspect.
          </p>
          <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/verify" data-cursor="VERIFY" className="button-primary">
              Verify a claim <ArrowRight size={15} />
            </Link>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button-secondary"
            >
              Use Telegram Bot <ExternalLink size={13} />
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
