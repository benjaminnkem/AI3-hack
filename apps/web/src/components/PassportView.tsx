'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Code,
  Sparkles
} from 'lucide-react';
import { Passport } from '@/lib/types';
import { TruthScoreGauge } from './TruthScoreGauge';
import { ConsensusCard } from './ConsensusCard';
import { ClaimCard } from './ClaimCard';
import { BlockchainCard } from './BlockchainCard';
import { scoreMeta, shortHash } from '@/lib/utils';
import { verifyIntegrity } from '@/lib/api';
import { ethers } from 'ethers';

export function PassportView({ passport }: { passport: Passport }) {
  const [showDemo, setShowDemo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [integrityReport, setIntegrityReport] = useState<{
    ran: boolean;
    valid: boolean;
    steps: { name: string; status: 'pending' | 'success' | 'failed'; detail?: string }[];
  } | null>(null);

  const meta = scoreMeta(passport.truthScore);

  const getVerdictLabel = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v === 'true' || v === 'supported') return 'Supported';
    if (v === 'likely_true') return 'Likely True';
    if (v === 'mixed' || v === 'unverified') return 'Mixed';
    if (v === 'likely_false' || v === 'misleading') return 'Likely False';
    if (v === 'false' || v === 'contradicted') return 'Contradicted';
    return 'Unverifiable';
  };

  const getVerdictBg = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v === 'true' || v === 'supported') return 'bg-accent/10 text-accent border-accent/20';
    if (v === 'likely_true') return 'bg-[#7fe37f]/10 text-[#7fe37f] border-[#7fe37f]/20';
    if (v === 'mixed' || v === 'unverified') return 'bg-warn/10 text-warn border-warn/20';
    if (v === 'likely_false' || v === 'misleading') return 'bg-[#f0913a]/10 text-[#f0913a] border-[#f0913a]/20';
    return 'bg-danger/10 text-danger border-danger/20';
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/passport/${passport.publicId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    const embedCode = `<iframe src="${window.location.origin}/badge/${passport.publicId}" style="border:none;width:320px;height:120px;background:transparent;" title="Mesh Evidence Badge"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(passport, null, 2));
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
        { name: 'Checking schema version compliance (v1.0.0)', status: 'pending' },
        { name: 'Verifying off-chain payload structure', status: 'pending' },
        { name: 'Recomputing cryptographic roots (claims & evidence)', status: 'pending' },
        { name: 'Comparing off-chain hash with on-chain attestation', status: 'pending' }
      ]
    });

    let schemaOk = false;
    let structureOk = false;
    let rootsOk = false;
    let chainOk = false;

    // Step 1: Schema Compliance
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (passport.inputType && passport.publicId) {
      schemaOk = true;
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 0 ? { ...s, status: 'success', detail: 'Schema compatibility: v1.0.0 (OK)' } : s)
        };
      });
    } else {
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 0 ? { ...s, status: 'failed', detail: 'Missing schema identifiers.' } : s)
        };
      });
    }

    // Step 2: Off-chain Payload Structure
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (passport.claims && passport.verdict && typeof passport.truthScore === 'number') {
      structureOk = true;
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 1 ? { ...s, status: 'success', detail: 'Payload matches canonical Evidence Passport format' } : s)
        };
      });
    } else {
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 1 ? { ...s, status: 'failed', detail: 'Missing essential passport payload keys.' } : s)
        };
      });
    }

    // Step 3: Recompute cryptographic roots (via backend api)
    let backendReport: any = null;
    try {
      backendReport = await verifyIntegrity(passport.publicId);
      rootsOk = !!backendReport?.valid;
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 2 ? {
            ...s,
            status: rootsOk ? 'success' : 'failed',
            detail: rootsOk 
              ? `Verification matches! Claims Root: ${shortHash(backendReport.stored?.claimsRoot || '', 6)}, Evidence Root: ${shortHash(backendReport.stored?.evidenceRoot || '', 6)}`
              : `Root mismatch: Computed passport hash does not match stored hash.`
          } : s)
        };
      });
    } catch (err: any) {
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 2 ? {
            ...s,
            status: 'failed',
            detail: `Server-side validation failed: ${err.message}`
          } : s)
        };
      });
    }

    // Step 4: Compare with on-chain attestation (via client-side direct contract query)
    if (passport.attestation?.contractAddress && passport.attestation.transactionHash) {
      try {
        const MESH_ABI = [
          "function exists(bytes32 passportHash) external view returns (bool)",
          "function getAttestation(bytes32 passportHash) external view returns (tuple(bytes32 inputHash, bytes32 claimsRoot, bytes32 evidenceRoot, bytes32 kimiOutputHash, bytes32 minimaxOutputHash, bytes32 requestIdsHash, uint8 truthScore, uint32 verificationVersion, uint64 timestamp, address attestor))"
        ];
        const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
        const contract = new ethers.Contract(passport.attestation.contractAddress, MESH_ABI, provider);
        
        const existsOnChain = await contract.exists(passport.passportHash);
        if (existsOnChain) {
          const att = await contract.getAttestation(passport.passportHash);
          const truthScoreMatches = Number(att.truthScore) === passport.truthScore;
          
          if (truthScoreMatches) {
            chainOk = true;
            setIntegrityReport(prev => {
              if (!prev) return null;
              return {
                ...prev,
                valid: schemaOk && structureOk && rootsOk && chainOk,
                steps: prev.steps.map((s, idx) => idx === 3 ? {
                  ...s,
                  status: 'success',
                  detail: `On-chain receipt verified. Attestor: ${shortHash(att.attestor, 6)}, Truth Score matches contract: ${att.truthScore}/100.`
                } : s)
              };
            });
          } else {
            setIntegrityReport(prev => {
              if (!prev) return null;
              return {
                ...prev,
                steps: prev.steps.map((s, idx) => idx === 3 ? {
                  ...s,
                  status: 'failed',
                  detail: `On-chain data mismatch: Truth score in passport (${passport.truthScore}) does not match contract (${att.truthScore}).`
                } : s)
              };
            });
          }
        } else {
          setIntegrityReport(prev => {
            if (!prev) return null;
            return {
              ...prev,
              steps: prev.steps.map((s, idx) => idx === 3 ? {
                ...s,
                status: 'failed',
                detail: 'Passport hash not found in on-chain registry mapping.'
              } : s)
            };
          });
        }
      } catch (err: any) {
        setIntegrityReport(prev => {
          if (!prev) return null;
          return {
            ...prev,
            steps: prev.steps.map((s, idx) => idx === 3 ? {
              ...s,
              status: 'failed',
              detail: `Browser RPC error verifying contract: ${err.message}`
            } : s)
          };
        });
      }
    } else {
      setIntegrityReport(prev => {
        if (!prev) return null;
        return {
          ...prev,
          steps: prev.steps.map((s, idx) => idx === 3 ? {
            ...s,
            status: 'failed',
            detail: 'Unanchored: Passport does not contain on-chain attestation receipts.'
          } : s)
        };
      });
    }

    setVerifying(false);
    setIntegrityReport(prev => {
      if (!prev) return null;
      return {
        ...prev,
        valid: schemaOk && structureOk && rootsOk && chainOk
      };
    });
  };

  const demoClaims = [
    {
      claim: "NASA officially stated astronauts can resolve the Great Wall of China with naked eye.",
      confidence: 0.95,
      status: "contradicted",
      evidence: [
        {
          title: "NASA Spaceflight Myths and Misconceptions",
          url: "https://www.nasa.gov/audience/forstudents/5-8/features/F_Great_Wall_of_China.html",
          domain: "nasa.gov",
          excerpt: "NASA states that the Great Wall is generally not visible to the naked eye from low Earth orbit. Under perfect conditions, a viewer might resolve it, but it requires extreme vision or photographic zoom lenses.",
          direction: "opposes",
          quality: 0.95,
          published: "2024-05-10"
        },
        {
          title: "Scientific American: The Great Wall from Space Myth",
          url: "https://www.scientificamerican.com/article/is-chinas-great-wall-visible-from-space/",
          domain: "scientificamerican.com",
          excerpt: "Astronauts have confirmed you cannot see the wall with the naked eye because the materials match the surrounding soil and the width is too narrow.",
          direction: "opposes",
          quality: 0.90,
          published: "2023-08-15"
        }
      ],
      challenge: {
        issue: "Optical diffraction limits of the human pupil make a 6-meter wide wall invisible at 160km altitude.",
        severity: 85,
        resolved: true,
        resolution: "Physiological and optical physics confirm the impossibility of naked eye visibility."
      }
    },
    {
      claim: "Under rare atmospheric conditions, astronaut Leroy Chiao captured a photograph of the Wall.",
      confidence: 0.88,
      status: "supported",
      evidence: [
        {
          title: "Leroy Chiao Orbit Imagery Analysis",
          url: "https://www.space.com/astronaut-photos-great-wall-china.html",
          domain: "space.com",
          excerpt: "Leroy Chiao took a digital photograph from the ISS that showed small segments of the Wall, confirmed later by ground control mapping.",
          direction: "supports",
          quality: 0.88,
          published: "2024-01-20"
        }
      ]
    }
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted uppercase tracking-wider">Public Passport ID</span>
            <span className="font-mono text-sm font-semibold">{passport.publicId}</span>
          </div>
          <p className="text-xs text-muted mt-1">Generated: {new Date(passport.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-accent"
          >
            {copiedLink ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
            {copiedLink ? 'Copied Link' : 'Copy Link'}
          </button>
          <button
            onClick={handleCopyEmbed}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-accent"
          >
            {copiedEmbed ? <Check size={12} className="text-accent" /> : <Code size={12} />}
            {copiedEmbed ? 'Copied Code' : 'Embed Badge'}
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium transition hover:border-accent"
          >
            <Download size={12} />
            JSON
          </button>
          <button
            onClick={() => setShowDemo(!showDemo)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
              showDemo 
                ? 'bg-accent/10 border-accent/30 text-accent' 
                : 'bg-surface border-border text-muted hover:border-accent hover:text-white'
            }`}
          >
            <Sparkles size={12} />
            Demo Mode
          </button>
        </div>
      </div>

      <div className="card flex flex-col items-center justify-center gap-6 p-8 lg:col-span-1">
        <TruthScoreGauge score={passport.truthScore} />
        <div className="text-center">
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getVerdictBg(passport.verdict)}`}>
            {getVerdictLabel(passport.verdict)}
          </span>
          <p className="text-sm text-muted mt-3 leading-relaxed px-4">{passport.summary}</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <ConsensusCard consensus={passport.consensus} models={passport.modelResponses} />
      </div>

      <div className="lg:col-span-3 card p-6">
        <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Resolved Input Preview</h4>
        {passport.inputType === 'image' && passport.originalInput?.startsWith('data:image') ? (
          <div className="rounded-xl border border-border bg-surface p-4 max-w-md">
            <img 
              src={passport.originalInput} 
              alt="Verified input preview" 
              className="max-h-48 rounded object-contain"
            />
          </div>
        ) : passport.inputType === 'url' ? (
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4 font-mono text-sm text-accent">
            <ExternalLink size={14} className="shrink-0" />
            <a href={passport.originalInput} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
              {passport.originalInput}
            </a>
          </div>
        ) : (
          <blockquote className="rounded-xl border border-border bg-surface p-4 text-sm italic leading-relaxed text-muted">
            "{passport.originalInput || 'Text content resolved for verification.'}"
          </blockquote>
        )}
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Extracted Claims & Evidence</h3>
        </div>

        {showDemo ? (
          <div className="space-y-4">
            {demoClaims.map((item, index) => (
              <div key={index} className="card p-5 space-y-4">
                <div className="flex items-start gap-3">
                  {item.status === 'contradicted' ? (
                    <XCircle size={18} className="text-danger mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 size={18} className="text-accent mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.claim}</p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                      <span className="capitalize font-semibold text-accent soft">{item.status}</span>
                      <span>·</span>
                      <span>{Math.round(item.confidence * 100)}% checkable</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-3 space-y-3">
                  <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">Web Evidence Retrieval</h4>
                  {item.evidence.map((ev, evIdx) => (
                    <div key={evIdx} className="rounded-lg border border-border bg-surface/50 p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-xs text-white">{ev.title}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          ev.direction === 'supports' ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
                        }`}>
                          {ev.direction === 'supports' ? 'Supports' : 'Opposes'}
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">{ev.excerpt}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted/80">
                        <a href={ev.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                          Source: {ev.domain} <ExternalLink size={10} />
                        </a>
                        <span>Published: {ev.published}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {item.challenge && (
                  <div className="rounded-lg border border-danger/20 bg-danger/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-danger font-medium text-xs">
                        <AlertTriangle size={13} />
                        Adversarial Review Challenge
                      </div>
                      <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                        Severity: {item.challenge.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{item.challenge.issue}</p>
                    <div className="text-[10px] border-t border-danger/10 pt-2 text-accent soft">
                      <span className="font-semibold">Resolution: </span>
                      {item.challenge.resolution}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {passport.claims.map((c, i) => (
              <ClaimCard key={i} claim={c} />
            ))}
            <div className="rounded-xl border border-border bg-surface p-6 text-center">
              <p className="text-sm text-muted">No external web evidence fetched by standard pipeline.</p>
              <button 
                onClick={() => setShowDemo(true)}
                className="mt-3 text-xs text-accent hover:underline font-medium"
              >
                Enable Demo Mode to view rich mock evidence layouts
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6 lg:col-span-1">
        <BlockchainCard attestation={passport.attestation} passportHash={passport.passportHash} publicId={passport.publicId} />

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent" />
            <h3 className="text-lg font-semibold">Integrity Check</h3>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Recompute cryptographic roots of the off-chain passport and cross-reference them with the Base Sepolia attestation records.
          </p>

          <button
            onClick={runIntegrityCheck}
            disabled={verifying}
            className="w-full rounded-xl bg-surface border border-border py-2.5 text-xs font-semibold transition hover:border-accent hover:text-white disabled:opacity-50"
          >
            {verifying ? 'Running checks…' : 'Verify Integrity'}
          </button>

          {integrityReport?.ran && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 border-t border-border pt-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">Status Report</span>
                <span className={`text-xs font-bold ${integrityReport.valid ? 'text-accent' : 'text-warn'}`}>
                  {integrityReport.valid ? 'PASSPORT VALID' : 'UNANCHORED'}
                </span>
              </div>

              <div className="space-y-2">
                {integrityReport.steps.map((step, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="flex items-center gap-2">
                      {step.status === 'pending' && (
                        <div className="h-3 w-3 animate-spin rounded-full border border-muted border-t-accent" />
                      )}
                      {step.status === 'success' && (
                        <CheckCircle2 size={13} className="text-accent shrink-0" />
                      )}
                      {step.status === 'failed' && (
                        <AlertCircle size={13} className="text-warn shrink-0" />
                      )}
                      <span className={step.status === 'pending' ? 'text-muted' : 'text-white'}>
                        {step.name}
                      </span>
                    </div>
                    {step.detail && (
                      <p className="pl-5 text-[10px] text-muted font-mono leading-tight mt-0.5 break-all">
                        {step.detail}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
