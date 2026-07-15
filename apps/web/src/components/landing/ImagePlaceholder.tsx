import { Image as ImageIcon, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ImagePlaceholder({
  label,
  path,
  aspect = 'wide',
}: {
  label: string;
  path: string;
  aspect?: 'wide' | 'portrait';
}) {
  return (
    <div
      className={cn(
        'technical-panel group relative isolate grid overflow-hidden bg-surface/70 p-5',
        aspect === 'wide' ? 'min-h-52' : 'min-h-72',
      )}
      role="img"
      aria-label={`${label} placeholder`}
    >
      <div className="mesh-grid absolute inset-0 opacity-50" aria-hidden />
      <ScanLine
        className="absolute right-4 top-4 text-accent/40 transition group-hover:text-accent"
        size={18}
        aria-hidden
      />
      <div className="relative z-10 place-self-center text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-accent/20 bg-accent/10 text-accent">
          <ImageIcon size={18} aria-hidden />
        </span>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="mt-1 font-mono text-[10px] text-muted">Screenshot replacement slot</p>
      </div>
      <code className="relative z-10 mt-auto truncate border-t border-border/70 pt-3 text-[10px] text-muted">
        {path}
      </code>
    </div>
  );
}
