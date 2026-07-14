import { Link2, ShieldCheck } from 'lucide-react';
import { Attestation } from '@/lib/types';
import { shortHash } from '@/lib/utils';

export function BlockchainCard({
  attestation,
  passportHash,
}: {
  attestation: Attestation | null;
  passportHash: string;
}) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck size={18} className="text-accent" />
        <h3 className="text-lg font-semibold">On-chain Attestation</h3>
      </div>
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted">Passport hash</dt>
          <dd className="font-mono text-accent">{shortHash(passportHash, 8)}</dd>
        </div>
        {attestation?.transactionHash ? (
          <>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Transaction</dt>
              <dd className="flex items-center gap-1.5 font-mono">
                <Link2 size={13} />
                {shortHash(attestation.transactionHash, 8)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Block</dt>
              <dd className="font-mono">{attestation.blockNumber}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Chain ID</dt>
              <dd className="font-mono">{attestation.chainId}</dd>
            </div>
          </>
        ) : (
          <p className="rounded-lg bg-surface p-3 text-xs text-muted">
            This passport is hashed and verifiable, but no chain credentials were configured at
            verification time, so it carries no on-chain receipt yet.
          </p>
        )}
      </dl>
    </div>
  );
}
