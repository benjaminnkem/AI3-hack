import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Map a 0-100 score to a semantic colour + label. */
export function scoreMeta(score: number): { color: string; label: string } {
  if (score >= 85) return { color: '#22e59a', label: 'True' };
  if (score >= 65) return { color: '#7fe37f', label: 'Likely True' };
  if (score >= 45) return { color: '#f0c23a', label: 'Mixed' };
  if (score >= 25) return { color: '#f0913a', label: 'Likely False' };
  return { color: '#f0603a', label: 'False' };
}

export function shortHash(hash: string, size = 6): string {
  if (!hash) return '';
  return `${hash.slice(0, size + 2)}…${hash.slice(-size)}`;
}
