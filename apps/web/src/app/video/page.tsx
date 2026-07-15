'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Video } from 'lucide-react';
import { HeroBackdrop } from '@/components/landing/HeroBackdrop';
import { Reveal, fadeUp } from '@/components/landing/Motion';

export default function VideoDemoPage() {
  return (
    <div className="product-page relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px]">
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
          className="mx-auto max-w-4xl text-center"
        >
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="section-label inline-flex items-center gap-2 border-l border-accent bg-accent/[0.06] px-3 py-2">
              <Video size={13} />
              Product walkthrough
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="product-page-heading mt-7">
            Mesh Demo Video
          </motion.h1>

          <motion.p variants={fadeUp} className="section-copy mx-auto mt-7 text-center">
            Watch the complete walkthrough of Mesh, showcasing our multi-model consensus
            verification engine, live evidence extraction, and on-chain attestation registration.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-white/12 bg-card/80 p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur"
          >
            <div className="absolute -inset-10 -z-10 bg-accent/[0.08] blur-3xl" aria-hidden />

            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/e2rOyImZzsg?si=nI6qsgdyOvWVWz8L"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 flex flex-wrap justify-center gap-3">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-background shadow-glow transition hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] duration-200"
            >
              Verify a claim now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              Explore passports
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
