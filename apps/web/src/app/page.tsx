'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ShieldCheck, Network, FileCheck2, Boxes, ArrowRight, Activity } from 'lucide-react';
import { verify, getHistory } from '@/lib/api';
import { VerificationForm, VerificationFormValues } from '@/components/VerificationForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { scoreMeta } from '@/lib/utils';

const FEATURES = [
  {
    icon: Network,
    title: 'Multi-model consensus',
    body: 'Kimi and MiniMax score every claim independently via the Gonka Router — disagreement is surfaced, not hidden.',
  },
  {
    icon: FileCheck2,
    title: 'Evidence Passport',
    body: 'A structured, shareable record of claims, reasoning, model verdicts, and Gonka request IDs.',
  },
  {
    icon: Boxes,
    title: 'On-chain attestation',
    body: 'Each passport is hashed and anchored on-chain, making every verdict tamper-evident and auditable.',
  },
];

export default function Home() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: verify,
    onSuccess: (data) => {
      router.push(`/passport/${data.publicId}`);
    },
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });

  const handleSubmit = (values: VerificationFormValues) => {
    mutation.mutate({ inputType: values.inputType, input: values.input });
  };

  return (
    <div className="space-y-20">
      <section className="py-12 text-center relative overflow-hidden">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted">
          <ShieldCheck size={13} className="text-accent" />
          Multi-model consensus · Live evidence · On-chain receipt
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight">
          Every digital claim deserves a{' '}
          <span className="text-accent">verifiable Evidence Passport</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Mesh extracts claims, cross-checks them across independent AI models, and anchors a
          tamper-evident verdict on-chain.
        </p>

        <div className="mx-auto mt-12 max-w-2xl text-left">
          {mutation.isPending ? (
            <div className="space-y-4">
              <LoadingScreen />
            </div>
          ) : (
            <VerificationForm onSubmit={handleSubmit} loading={mutation.isPending} />
          )}

          {mutation.isError && (
            <div className="mt-4 card border-danger/40 p-4 text-sm text-danger bg-danger/5">
              Verification failed. Check that the API and Gonka credentials are configured.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card p-6">
            <Icon className="mb-4 text-accent" size={24} />
            <h3 className="mb-2 font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-accent animate-pulse" />
            <h2 className="text-2xl font-bold">Recent Passports</h2>
          </div>
          <Link href="/explore" className="text-sm text-accent hover:underline flex items-center gap-1">
            View all explorer <ArrowRight size={14} />
          </Link>
        </div>

        {historyLoading ? (
          <p className="text-muted">Loading recent verifications…</p>
        ) : !history || history.length === 0 ? (
          <p className="text-muted text-sm">No verifications processed yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="card p-5 flex flex-col justify-between h-48">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-medium capitalize text-muted border border-border">
                      {item.inputType}
                    </span>
                    <span className="text-[10px] text-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-3 text-muted leading-relaxed">
                    {item.status === 'completed' && item.truthScore != null ? (
                      `Evidence Passport registered with a truth score of ${Math.round(item.truthScore)}/100.`
                    ) : (
                      `Verification state: ${item.status}`
                    )}
                  </p>
                </div>
                {item.passport?.publicId && (
                  <Link 
                    href={`/passport/${item.passport.publicId}`} 
                    className="mt-4 text-xs font-semibold text-accent hover:underline flex items-center gap-1 w-fit"
                  >
                    View passport →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card p-8 bg-surface/30 border-border/80 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-lg font-semibold">Integrate Mesh Protocol</h3>
          <p className="text-sm text-muted leading-relaxed">
            Mesh exposes a REST API and embeddable badges to certify content truthfulness across third-party websites, CMS dashboards, and AI agents.
          </p>
        </div>
        <Link href="/about" className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium hover:border-accent text-white transition shrink-0">
          Developer Docs
        </Link>
      </section>
    </div>
  );
}
