import Link from 'next/link';
import { ShieldCheck, Network, FileCheck2, Boxes } from 'lucide-react';

const FEATURES = [
  { icon: Network, title: 'Multi-model consensus', body: 'Kimi and MiniMax score every claim independently via the Gonka Router — disagreement is surfaced, not hidden.' },
  { icon: FileCheck2, title: 'Evidence Passport', body: 'A structured, shareable record of claims, reasoning, model verdicts, and Gonka request IDs.' },
  { icon: Boxes, title: 'On-chain attestation', body: 'Each passport is hashed and anchored on-chain, making every verdict tamper-evident and auditable.' },
];

export default function Home() {
  return (
    <div>
      <section className="py-20 text-center">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted">
          <ShieldCheck size={13} className="text-accent" /> Decentralized AI verification protocol
        </div>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight">
          Every digital claim deserves a{' '}
          <span className="text-accent">verifiable Evidence Passport</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          ProofMesh extracts claims, cross-checks them across independent AI models, and anchors a
          tamper-evident verdict on-chain.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/verify" className="rounded-xl bg-accent px-6 py-3 font-semibold text-background shadow-glow transition hover:opacity-90">
            Verify a claim
          </Link>
          <Link href="/about" className="rounded-xl border border-border px-6 py-3 font-medium transition hover:border-accent">
            How it works
          </Link>
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
    </div>
  );
}
