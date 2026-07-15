import { Link2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Attestation } from '@/lib/types';
import { shortHash } from '@/lib/utils';
import { useState } from 'react';
import { retryAttestation } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

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
      toast.success('Attestation successfully registered on-chain!');
      queryClient.invalidateQueries({ queryKey: ['passport', publicId] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit attestation.');
    } finally {
      setRetrying(false);
    }
  };

  const isConfirmed = attestation?.status === 'CONFIRMED' || !!attestation?.transactionHash;

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" />
          <h3 className="text-lg font-semibold">On-chain Attestation</h3>
        </div>
        {attestation?.status && (
          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
            isConfirmed
              ? 'bg-accent/15 border-accent/30 text-accent'
              : attestation.status === 'FAILED'
                ? 'bg-danger/15 border-danger/30 text-danger'
                : 'bg-surface border-border text-muted'
          }`}>
            {attestation.status}
          </span>
        )}
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Passport hash</dt>
          <dd className="font-mono text-accent">{shortHash(passportHash, 8)}</dd>
        </div>
        {isConfirmed && attestation ? (
          <>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Transaction</dt>
              <dd className="flex items-center gap-1.5 font-mono">
                {attestation.explorerUrl ? (
                  <a
                    href={attestation.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-white hover:underline text-accent"
                  >
                    <Link2 size={13} />
                    {shortHash(attestation.transactionHash || '', 8)}
                  </a>
                ) : (
                  <>
                    <Link2 size={13} />
                    {shortHash(attestation.transactionHash || '', 8)}
                  </>
                )}
              </dd>
            </div>
            {attestation.blockNumber && (
              <div className="flex items-center justify-between">
                <dt className="text-muted">Block</dt>
                <dd className="font-mono">{attestation.blockNumber}</dd>
              </div>
            )}
            {attestation.chainId && (
              <div className="flex items-center justify-between">
                <dt className="text-muted">Chain ID</dt>
                <dd className="font-mono">{attestation.chainId}</dd>
              </div>
            )}
            {attestation.attestor && (
              <div className="flex items-center justify-between">
                <dt className="text-muted">Attestor</dt>
                <dd className="font-mono text-xs">{shortHash(attestation.attestor, 6)}</dd>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="rounded-lg bg-surface p-3 text-xs text-muted leading-relaxed">
              This passport is hashed and verifiable, but no confirmed on-chain receipt exists yet.
            </p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-accent py-2 text-xs font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} />
              {retrying ? 'Attesting...' : 'Register On-chain Attestation'}
            </button>
          </div>
        )}
      </dl>
    </div>
  );
}
