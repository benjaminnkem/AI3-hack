'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Code,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { IntegrityCheckResult, Passport } from '@/lib/types';
import { TruthScoreGauge } from './TruthScoreGauge';
import { ConsensusCard } from './ConsensusCard';
import { ClaimCard } from './ClaimCard';
import { BlockchainCard } from './BlockchainCard';
import { cn, formatScore, shortHash, verdictMeta } from '@/lib/utils';
import { verifyIntegrity } from '@/lib/api';

type StepStatus = 'pending' | 'success' | 'failed' | 'skipped';

interface IntegrityStep {
  name: string;
  status: StepStatus;
  detail?: string;
}

function inputTypeIcon(type: string) {
  const t = type.toLowerCase();
  if (t === 'url') return Link2;
  if (t === 'image') return ImageIcon;
  return FileText;
}

export function PassportView({ passport }: { passport: Passport }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<{
    ran: boolean;
    valid: boolean;
    steps: IntegrityStep[];
  } | null>(null);

  const meta = verdictMeta(passport.verdict);
  const InputIcon = inputTypeIcon(passport.input.type);
  const challenges = passport.consensus.adversarialChallenges || [];
  const openChallenges = challenges.filter((c) => !c.resolved);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/passport/${passport.publicId}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = async () => {
    const embedCode = `<iframe src="${window.location.origin}/badge/${passport.publicId}" style="border:none;width:320px;height:120px;background:transparent;" title="Mesh Evidence Badge"></iframe>`;
    await navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `passport_${passport.publicId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const runIntegrityCheck = async () => {
    setVerifying(true);
    setIntegrityReport({
      ran: true,
      valid: false,
      steps: [
        { name: 'Fetch integrity report from API', status: 'pending' },
        { name: 'Compare recomputed roots with stored passport', status: 'pending' },
        { name: 'Compare stored values with on-chain attestation', status: 'pending' },
      ],
    });

    try {
      const report: IntegrityCheckResult = await verifyIntegrity(passport.publicId);

      const hashKeys = [
        'passportHash',
        'claimsRoot',
        'evidenceRoot',
        'kimiOutputHash',
        'minimaxOutputHash',
        'requestIdsHash',
      ] as const;

      const rootMatches = hashKeys.every((key) => report.matches?.[key] === true);
      const failedRoots = hashKeys.filter((key) => report.matches?.[key] !== true);

      setIntegrityReport((prev) => {
        if (!prev) return null;
        const steps = [...prev.steps];
        steps[0] = {
          ...steps[0],
          status: 'success',
          detail: `Schema ${passport.schemaVersion} · version ${passport.version}`,
        };
        steps[1] = {
          ...steps[1],
          status: rootMatches ? 'success' : 'failed',
          detail: rootMatches
            ? `Passport hash ${shortHash(report.stored?.passportHash || passport.passportHash, 8)} matches recomputed roots`
            : `Mismatch on: ${failedRoots.join(', ') || 'unknown fields'}`,
        };

        const onChain = report.matches?.onChain;
        if (!onChain) {
          steps[2] = {
            ...steps[2],
            status: report.valid ? 'skipped' : 'failed',
            detail: report.valid
              ? 'No on-chain record required or available; off-chain integrity is valid'
              : 'No matching on-chain attestation found for this passport hash',
          };
        } else if (typeof onChain === 'object') {
          const chainEntries = Object.entries(onChain);
          const chainOk = chainEntries.every(([, value]) => value === true);
          const bad = chainEntries.filter(([, value]) => value !== true).map(([key]) => key);
          steps[2] = {
            ...steps[2],
            status: chainOk ? 'success' : 'failed',
            detail: chainOk
              ? `On-chain fields match for score ${formatScore(passport.truthScore)}`
              : `On-chain mismatch: ${bad.join(', ')}`,
          };
        }

        return {
          ran: true,
          valid: !!report.valid,
          steps,
        };
      });
    } catch (err: any) {
      setIntegrityReport({
        ran: true,
        valid: false,
        steps: [
          {
            name: 'Fetch integrity report from API',
            status: 'failed',
            detail: err?.message || 'Integrity endpoint failed',
          },
          {
            name: 'Compare recomputed roots with stored passport',
            status: 'skipped',
            detail: 'Skipped after API failure',
          },
          {
            name: 'Compare stored values with on-chain attestation',
            status: 'skipped',
            detail: 'Skipped after API failure',
          },
        ],
      });
    } finally {
      setVerifying(false);
    }
  };

  const integrityRows = [
    { label: 'Passport hash', value: passport.integrity.passportHash || passport.passportHash },
    { label: 'Input hash', value: passport.input.inputHash },
    { label: 'Claims root', value: passport.integrity.claimsRoot },
    { label: 'Evidence root', value: passport.integrity.evidenceRoot },
    { label: 'Kimi output hash', value: passport.integrity.kimiOutputHash },
    { label: 'MiniMax output hash', value: passport.integrity.minimaxOutputHash },
    { label: 'Request IDs hash', value: passport.integrity.requestIdsHash },
  ].filter((row) => row.value);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/8 bg-card/60 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Public passport
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                v{passport.version}
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">
                schema {passport.schemaVersion}
              </span>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold sm:text-base">{passport.publicId}</p>
            <p className="mt-1 text-xs text-muted">
              Generated {new Date(passport.generatedAt).toLocaleString()}
              {passport.verificationId ? ` · Verification ${shortHash(passport.verificationId, 4)}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium transition hover:border-accent/40"
            >
              {copiedLink ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
              {copiedLink ? 'Copied link' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={handleCopyEmbed}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium transition hover:border-accent/40"
            >
              {copiedEmbed ? <Check size={12} className="text-accent" /> : <Code size={12} />}
              {copiedEmbed ? 'Copied embed' : 'Embed badge'}
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium transition hover:border-accent/40"
            >
              <Download size={12} />
              JSON
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-white/8 bg-card/60 p-8 lg:col-span-1">
          <TruthScoreGauge score={passport.truthScore} verdict={passport.verdict} />
          <div className="text-center">
            <span
              className={cn(
                'inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider',
                meta.className,
              )}
            >
              {meta.label}
            </span>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl border border-white/5 bg-black/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Truth</p>
                <p className="text-lg font-bold tabular-nums">{formatScore(passport.truthScore)}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-black/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Confidence</p>
                <p className="text-lg font-bold tabular-nums">
                  {formatScore(passport.confidenceScore)}
                </p>
              </div>
            </div>
            {passport.summary ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">{passport.summary}</p>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2">
          <ConsensusCard consensus={passport.consensus} models={passport.modelResponses} />
        </div>
      </div>

      <div className="rounded-3xl border border-white/8 bg-card/60 p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <InputIcon size={15} className="text-accent" />
          <h4 className="text-sm font-semibold">Resolved input</h4>
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            {passport.input.type}
          </span>
        </div>

        {passport.input.type === 'image' && passport.input.imageUrl ? (
          <div className="space-y-3">
            <div className="max-w-md overflow-hidden rounded-2xl border border-white/8 bg-black/20 p-3">
              <img
                src={passport.input.imageUrl}
                alt="Verified input"
                className="max-h-56 w-full rounded-xl object-contain"
              />
            </div>
            {passport.input.displayText ? (
              <p className="text-sm leading-relaxed text-muted">{passport.input.displayText}</p>
            ) : null}
          </div>
        ) : passport.input.type === 'url' && (passport.input.sourceUrl || passport.input.displayText) ? (
          <div className="space-y-3">
            {passport.input.sourceUrl ? (
              <a
                href={passport.input.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 font-mono text-sm text-accent transition hover:border-accent/30"
              >
                <ExternalLink size={14} className="shrink-0" />
                <span className="break-all">{passport.input.sourceUrl}</span>
              </a>
            ) : null}
            {passport.input.displayText ? (
              <p className="text-sm leading-relaxed text-muted">{passport.input.displayText}</p>
            ) : null}
          </div>
        ) : (
          <blockquote className="rounded-2xl border border-white/8 bg-black/20 p-4 text-sm leading-relaxed text-muted">
            {passport.input.displayText || 'No display text was stored for this passport.'}
          </blockquote>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Claims and evidence</h3>
              <p className="mt-1 text-xs text-muted">
                {passport.claims.length} claim{passport.claims.length === 1 ? '' : 's'} ·{' '}
                {passport.evidence.length} evidence item
                {passport.evidence.length === 1 ? '' : 's'}
                {openChallenges.length > 0
                  ? ` · ${openChallenges.length} open challenge${openChallenges.length === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
          </div>

          {passport.claims.length > 0 ? (
            <div className="space-y-3">
              {passport.claims.map((claim) => (
                <ClaimCard key={claim.id || claim.text} claim={claim} challenges={challenges} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-card/40 px-6 py-12 text-center">
              <p className="text-sm text-muted">
                No independently verifiable factual claims were extracted from this input.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <BlockchainCard
            attestation={passport.attestation}
            passportHash={passport.passportHash}
            publicId={passport.publicId}
          />

          <div className="rounded-3xl border border-white/8 bg-card/60 p-6">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent" />
              <h3 className="text-lg font-semibold">Integrity</h3>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-muted">
              Recompute cryptographic roots from the stored passport and compare them with the API
              integrity endpoint and on-chain attestation when available.
            </p>

            <div className="mb-4 space-y-2">
              {integrityRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                >
                  <span className="text-[11px] text-muted">{row.label}</span>
                  <span className="font-mono text-[10px] text-white/80" title={row.value}>
                    {shortHash(row.value, 6)}
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={runIntegrityCheck}
              disabled={verifying}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 text-xs font-semibold transition hover:border-accent/40 disabled:opacity-50"
            >
              {verifying ? 'Running integrity check…' : 'Verify integrity'}
            </button>

            {integrityReport?.ran ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-3 border-t border-white/5 pt-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Status
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold',
                      integrityReport.valid ? 'text-accent' : 'text-warn',
                    )}
                  >
                    {integrityReport.valid ? 'VALID' : 'CHECK FAILED'}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {integrityReport.steps.map((step) => (
                    <div key={step.name} className="text-xs">
                      <div className="flex items-start gap-2">
                        {step.status === 'pending' ? (
                          <div className="mt-0.5 h-3 w-3 animate-spin rounded-full border border-muted border-t-accent" />
                        ) : null}
                        {step.status === 'success' ? (
                          <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-accent" />
                        ) : null}
                        {step.status === 'failed' ? (
                          <AlertCircle size={13} className="mt-0.5 shrink-0 text-warn" />
                        ) : null}
                        {step.status === 'skipped' ? (
                          <AlertCircle size={13} className="mt-0.5 shrink-0 text-muted" />
                        ) : null}
                        <span className={step.status === 'pending' ? 'text-muted' : 'text-white'}>
                          {step.name}
                        </span>
                      </div>
                      {step.detail ? (
                        <p className="mt-0.5 break-all pl-5 font-mono text-[10px] leading-tight text-muted">
                          {step.detail}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </div>

          {passport.requestIds.length > 0 || passport.modelResponses.some((m) => m.requestId) ? (
            <div className="rounded-3xl border border-white/8 bg-card/60 p-6">
              <h3 className="mb-3 text-sm font-semibold">Gonka audit IDs</h3>
              <ul className="space-y-2">
                {(passport.requestIds.length
                  ? passport.requestIds
                  : passport.modelResponses.map((m) => m.requestId).filter(Boolean)
                ).map((id) => (
                  <li
                    key={String(id)}
                    className="rounded-xl border border-white/5 bg-black/20 px-3 py-2 font-mono text-[11px] text-muted"
                  >
                    {String(id)}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
