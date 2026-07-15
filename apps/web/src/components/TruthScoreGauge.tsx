'use client';

import { motion } from 'framer-motion';
import { scoreMeta, verdictMeta } from '@/lib/utils';

interface Props {
  score: number;
  size?: number;
  verdict?: string;
}

export function TruthScoreGauge({ score, size = 200, verdict }: Props) {
  const fromScore = scoreMeta(score);
  const fromVerdict = verdict ? verdictMeta(verdict) : null;
  const color = fromVerdict?.color || fromScore.color;
  const label = fromVerdict?.label || fromScore.label;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#232830"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      </div>
    </div>
  );
}
