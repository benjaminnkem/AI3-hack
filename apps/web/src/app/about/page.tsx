const STEPS = [
  [
    'Input resolution',
    'URLs are fetched and stripped to text; tweets and text pass straight through.',
  ],
  ['Claim extraction', 'A Gonka-routed model isolates discrete, checkable factual claims.'],
  [
    'Multi-model panel',
    'Kimi and MiniMax independently score the claim set through the Gonka Router.',
  ],
  [
    'Consensus engine',
    'Scores are blended (mean + median), agreement is measured, and disagreement is flagged, never hardcoded.',
  ],
  [
    'Evidence Passport',
    'A canonical JSON document is assembled with claims, reasoning, and Gonka request IDs.',
  ],
  [
    'On-chain attestation',
    'The passport is keccak256-hashed and anchored on-chain for tamper-evidence.',
  ],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">How Mesh works</h1>
        <p className="mt-2 text-muted">
          A decentralized truth engine built on multi-model consensus and on-chain attestation.
        </p>
      </div>
      <ol className="space-y-4">
        {STEPS.map(([title, body], i) => (
          <li key={title} className="card flex gap-4 p-5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent">
              {i + 1}
            </span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
