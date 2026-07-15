'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPassport } from '@/lib/api';
import { scoreMeta } from '@/lib/utils';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function BadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['passport', id],
    queryFn: () => getPassport(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-xs text-muted">
        Loading Badge…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-1 border border-danger/30 bg-background p-3 text-center">
        <ShieldAlert size={16} className="text-danger" />
        <span className="text-[10px] font-semibold text-danger">Passport Not Found</span>
      </div>
    );
  }

  const meta = scoreMeta(data.truthScore);
  const isAttested = !!data.attestation?.transactionHash;

  return (
    <a
      href={`/passport/${data.publicId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-screen w-screen items-center justify-between border border-border bg-card p-4 hover:border-accent/40 transition-colors duration-200 select-none overflow-hidden"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
          <ShieldCheck size={14} className="text-accent" />
          Mesh Passport
        </div>
        <div>
          <div className="text-sm font-bold uppercase tracking-wider" style={{ color: meta.color }}>
            {meta.label}
          </div>
          <div className="text-[9px] text-muted mt-0.5 font-mono">ID: {data.publicId}</div>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between h-full text-right">
        <div className="flex items-center gap-1">
          <span className="text-2xl font-black tracking-tight" style={{ color: meta.color }}>
            {Math.round(data.truthScore)}
          </span>
          <span className="text-[10px] text-muted font-semibold">/100</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-muted">
          {isAttested ? (
            <span className="text-accent font-semibold flex items-center gap-0.5">
              On-Chain Attested
            </span>
          ) : (
            <span>Hashed Payload</span>
          )}
        </div>
      </div>
    </a>
  );
}
