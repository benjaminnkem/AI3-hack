import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreMeta(score: number): { color: string; label: string } {
  if (score >= 70) return { color: '#22e59a', label: 'Supported' };
  if (score >= 50) return { color: '#f0c23a', label: 'Unverified' };
  if (score >= 25) return { color: '#f0913a', label: 'Misleading' };
  return { color: '#f0603a', label: 'Contradicted' };
}

export function verdictMeta(verdict: string): {
  label: string;
  color: string;
  className: string;
} {
  const v = (verdict || '').toLowerCase();
  if (v === 'supported' || v === 'true') {
    return {
      label: 'Supported',
      color: '#22e59a',
      className: 'bg-accent/10 text-accent border-accent/20',
    };
  }
  if (v === 'unverified' || v === 'mixed' || v === 'unverifiable') {
    return {
      label: v === 'unverifiable' ? 'Unverifiable' : 'Unverified',
      color: '#f0c23a',
      className: 'bg-warn/10 text-warn border-warn/20',
    };
  }
  if (v === 'misleading' || v === 'likely_false') {
    return {
      label: 'Misleading',
      color: '#f0913a',
      className: 'bg-[#f0913a]/10 text-[#f0913a] border-[#f0913a]/20',
    };
  }
  if (v === 'contradicted' || v === 'false') {
    return {
      label: 'Contradicted',
      color: '#f0603a',
      className: 'bg-danger/10 text-danger border-danger/20',
    };
  }
  return {
    label: verdict || 'Unknown',
    color: '#8a94a3',
    className: 'bg-white/5 text-muted border-white/10',
  };
}

export function directionMeta(direction: string): { label: string; className: string } {
  const d = (direction || '').toLowerCase();
  if (d === 'supports' || d === 'support') {
    return { label: 'Supports', className: 'bg-accent/10 text-accent border-accent/20' };
  }
  if (d === 'opposes' || d === 'oppose') {
    return { label: 'Opposes', className: 'bg-danger/10 text-danger border-danger/20' };
  }
  return { label: 'Neutral', className: 'bg-white/5 text-muted border-white/10' };
}

export function shortHash(hash: string, size = 6): string {
  if (!hash) return '';
  if (hash.length <= size * 2 + 1) return hash;
  return `${hash.slice(0, size + 2)}…${hash.slice(-size)}`;
}

export function formatScore(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) return '-';
  return String(Math.round(score));
}
