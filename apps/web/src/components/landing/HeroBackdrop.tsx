'use client';

import { motion } from 'framer-motion';

export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="mesh-grid absolute inset-0 opacity-[0.35]" />
      <div className="absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,229,154,0.14),transparent_60%)]" />

      <motion.div
        className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-accent/20 blur-[100px]"
        animate={{ x: [0, 40, -10, 0], y: [0, 30, -20, 0], scale: [1, 1.12, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-emerald-400/10 blur-[110px]"
        animate={{ x: [0, -35, 15, 0], y: [0, -25, 30, 0], scale: [1, 0.92, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-cyan-400/10 blur-[90px]"
        animate={{ x: [0, 25, -20, 0], y: [0, -15, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
