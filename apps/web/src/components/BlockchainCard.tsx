'use client';

import { useState } from 'react';
import { Link2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Attestation } from '@/lib/types';
import { shortHash } from '@/lib/utils';
import { retryAttestation } from '@/lib/api';

export function BlockchainCard({
  attestation,
  passportHash,
  publicId,
}: {
  attestation: Attestation | null;
  passportHash: string;
  publicId: string;
}) {
  const [retrying, setRetrying] = useState(false);
  const queryClient = useQueryClient();

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await retryAttestation(publicId);
      toast.success('Attestation registered on-chain');
      queryClient.invalidateQueries({ queryKey: ['passport', publicId] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit attestation');
    } finally {
      setRetrying(false);
    }
  };

  const status = (attestation?.status || '').toUpperCase();
  const isConfirmed = status === 'CONFIRMED' || !!attestation?.transactionHash;
  const isDisabled = status === 'DISABLED';
  const isFailed = status === 'FAILED';

  return (
    <div className="rounded-3xl border border-white/8 bg-card/60 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" />
          <h3 className="text-lg font-semibold">On-chain attestation</h3>
        </div>
        {attestation?.status ? (
          <span
            className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${
              isConfirmed
                ? 'border-accent/30 bg-accent/15 text-accent'
                : isFailed
                  ? 'border-danger/30 bg-danger/15 text-danger'
                  : 'border-white/10 bg-white/[0.03] text-muted'
            }`}
          >
            {attestation.status}
          </span>
        ) : null}
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Passport hash</dt>
          <dd className="font-mono text-xs text-accent" title={passportHash}>
            {shortHash(passportHash, 8) || '-'}
          </dd>
        </div>

        {attestation?.network ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Network</dt>
            <dd className="text-right text-xs capitalize">{attestation.network}</dd>
          </div>
        ) : null}

        {attestation?.contractAddress ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Contract</dt>
            <dd className="font-mono text-xs" title={attestation.contractAddress}>
              {shortHash(attestation.contractAddress, 6)}
            </dd>
          </div>
        ) : null}

        {isConfirmed && attestation ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Transaction</dt>
              <dd className="flex items-center gap-1.5 font-mono text-xs">
                {attestation.explorerUrl && attestation.transactionHash ? (
                  <a
                    href={attestation.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline"
                  >
                    <Link2 size={13} />
                    {shortHash(attestation.transactionHash, 8)}
                  </a>
                ) : (
                  <span>{shortHash(attestation.transactionHash || '', 8) || '-'}</span>
                )}
              </dd>
            </div>
            {attestation.blockNumber ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Block</dt>
                <dd className="font-mono text-xs">{attestation.blockNumber}</dd>
              </div>
            ) : null}
            {attestation.chainId != null ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Chain ID</dt>
                <dd className="font-mono text-xs">{attestation.chainId}</dd>
              </div>
            ) : null}
            {attestation.attestor ? (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Attestor</dt>
                <dd className="font-mono text-xs" title={attestation.attestor}>
                  {shortHash(attestation.attestor, 6)}
                </dd>
              </div>
            ) : null}
          </>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="rounded-2xl border border-white/5 bg-black/20 p-3 text-xs leading-relaxed text-muted">
              {isDisabled
                ? 'On-chain attestation is disabled for this environment. The passport hash is still stored and verifiable off-chain.'
                : isFailed
                  ? 'Attestation was attempted but failed. You can retry if the contract and operator key are configured.'
                  : 'This passport is hashed and verifiable off-chain, but no confirmed on-chain receipt exists yet.'}
            </p>
            {!isDisabled ? (
              <button
                type="button"
                onClick={handleRetry}
                disabled={retrying}
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-accent py-2.5 text-xs font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} />
                {retrying ? 'Attesting…' : 'Register on-chain attestation'}
              </button>
            ) : null}
          </div>
        )}
      </dl>
    </div>
  );
}
