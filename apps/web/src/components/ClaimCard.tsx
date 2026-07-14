import { CheckCircle2, HelpCircle, XCircle, AlertCircle } from 'lucide-react';
import { PassportClaim } from '@/lib/types';

const statusMeta: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  supported: { icon: CheckCircle2, color: 'text-accent' },
  contradicted: { icon: XCircle, color: 'text-danger' },
  mixed: { icon: AlertCircle, color: 'text-warn' },
  unverifiable: { icon: HelpCircle, color: 'text-muted' },
};

export function ClaimCard({ claim }: { claim: PassportClaim }) {
  const meta = statusMeta[claim.status] ?? statusMeta.unverifiable;
  const Icon = meta.icon;
  return (
    <div className="card flex items-start gap-3 p-4">
      <Icon size={18} className={`mt-0.5 shrink-0 ${meta.color}`} />
      <div className="flex-1">
        <p className="text-sm leading-relaxed">{claim.claim}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span className="capitalize">{claim.status}</span>
          <span>·</span>
          <span>{Math.round(claim.confidence * 100)}% checkable</span>
        </div>
      </div>
    </div>
  );
}
