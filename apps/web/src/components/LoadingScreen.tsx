'use client';

import { motion } from 'framer-motion';

const STEPS = [
  'Resolving input',
  'Extracting claims',
  'Querying Kimi via Gonka',
  'Querying MiniMax via Gonka',
  'Building consensus',
  'Hashing passport',
  'Anchoring on-chain',
];

export function LoadingScreen() {
  return (
    <div className="card flex flex-col items-center gap-6 p-10">
      <motion.div
        className="h-12 w-12 rounded-full border-2 border-border border-t-accent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <div className="space-y-2 text-center">
        {STEPS.map((s, i) => (
          <motion.p
            key={s}
            className="text-sm text-muted"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
          >
            {s}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
