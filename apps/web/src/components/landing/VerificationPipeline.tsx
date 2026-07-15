'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Binary,
  Boxes,
  FileSearch,
  GitCompareArrows,
  ScanText,
  Share2,
  Upload,
} from 'lucide-react';

const STEPS = [
  {
    icon: Upload,
    title: 'Submit',
    meta: 'TEXT · URL · IMAGE',
    body: 'Bring the original content into one neutral verification flow.',
  },
  {
    icon: ScanText,
    title: 'Extract',
    meta: '1—5 ATOMIC CLAIMS',
    body: 'Separate independently checkable facts from opinion and rhetoric.',
  },
  {
    icon: FileSearch,
    title: 'Investigate',
    meta: 'TAVILY LIVE WEB',
    body: 'Retrieve current supporting and opposing sources with provenance.',
  },
  {
    icon: GitCompareArrows,
    title: 'Challenge',
    meta: 'ADVERSARIAL PASS',
    body: 'Actively test the leading conclusion and keep unresolved gaps visible.',
  },
  {
    icon: Binary,
    title: 'Reach consensus',
    meta: 'KIMI × MINIMAX',
    body: 'Compare independent model assessments without erasing disagreement.',
  },
  {
    icon: Boxes,
    title: 'Attest',
    meta: 'SEPOLIA · 11155111',
    body: 'Anchor compact integrity hashes—not private content—on-chain.',
  },
  {
    icon: Share2,
    title: 'Share',
    meta: 'PUBLIC PASSPORT',
    body: 'Publish one reusable receipt for people, platforms, and agents.',
  },
];

export function VerificationPipeline() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-pipeline-step]', root.current);
      const ctx = gsap.context(() => {
        items.forEach((item, index) => {
          ScrollTrigger.create({
            trigger: item,
            start: 'top 54%',
            end: 'bottom 46%',
            onToggle: ({ isActive }) => {
              if (!isActive) return;
              items.forEach((node) => node.removeAttribute('data-active'));
              item.dataset.active = 'true';
              gsap.to(progress.current, {
                scaleY: (index + 1) / items.length,
                duration: 0.45,
                ease: 'power3.out',
                overwrite: true,
              });
            },
          });
        });
      }, root);
      return () => ctx.revert();
    });
    return () => media.revert();
  }, []);

  return (
    <section ref={root} id="how-it-works" className="section-shell scroll-mt-24 py-24 lg:py-36">
      <div className="mb-14 max-w-2xl lg:mb-20">
        <p className="section-label">02 / Verification pipeline</p>
        <h2 className="display-section mt-5">From raw claim to reusable receipt.</h2>
        <p className="section-copy mt-6">
          One structured investigation assembles claims, evidence, independent model outputs, and an
          integrity proof.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <div className="technical-panel relative min-h-[420px] overflow-hidden p-7 sm:p-10">
            <div className="mesh-grid absolute inset-0 opacity-40" aria-hidden />
            <div className="absolute left-10 top-10 h-[calc(100%-5rem)] w-px bg-border" aria-hidden>
              <div
                ref={progress}
                className="h-full origin-top scale-y-[0.14] bg-accent shadow-glow"
              />
            </div>
            <div className="relative ml-10 flex min-h-[340px] flex-col justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Live assembly trace
                </p>
                <p className="mt-5 text-2xl font-semibold tracking-tight">Evidence Passport v1</p>
              </div>
              <div className="space-y-3 font-mono text-[11px] text-muted">
                <div className="flex justify-between border-b border-border/70 pb-3">
                  <span>inputHash</span>
                  <span className="text-white/70">0x7f3a…c91e</span>
                </div>
                <div className="flex justify-between border-b border-border/70 pb-3">
                  <span>evidenceRoot</span>
                  <span className="text-white/70">0xb881…19a4</span>
                </div>
                <div className="flex justify-between border-b border-border/70 pb-3">
                  <span>models</span>
                  <span className="text-accent">2 independent</span>
                </div>
                <div className="flex justify-between">
                  <span>network</span>
                  <span className="text-white/70">Sepolia / 11155111</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ol className="divide-y divide-border border-y border-border">
          {STEPS.map(({ icon: Icon, title, meta, body }, index) => (
            <li
              key={title}
              data-pipeline-step
              data-active={index === 0 ? 'true' : undefined}
              className="pipeline-step group grid min-h-52 gap-5 py-8 transition-opacity lg:min-h-[260px] lg:content-center"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex h-10 w-10 items-center justify-center border border-border text-muted transition group-data-[active=true]:border-accent/40 group-data-[active=true]:bg-accent/10 group-data-[active=true]:text-accent">
                  <Icon size={17} aria-hidden />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {meta}
                </span>
              </div>
              <h3 className="text-3xl font-semibold tracking-tight text-white/55 transition group-data-[active=true]:text-white sm:text-4xl">
                {title}
              </h3>
              <p className="max-w-lg text-sm leading-7 text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
