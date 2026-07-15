import { Claim, Evidence, EvidenceDirection, Verdict } from '../../entities';
import {
  AdversarialOutput,
  InvestigatorOutput,
  NarrativeOutput,
} from './schemas';

function defaultClaimAssessment(claimId: string): InvestigatorOutput['claims'][number] {
  return {
    claimId,
    supportProbability: 50,
    confidence: 0,
    verdictSuggestion: Verdict.UNVERIFIED,
    reasoningSummary: 'Model omitted this claim; treated as unverified pending evidence.',
    evidenceAssessments: [],
    missingContext: ['Model response omitted this claim'],
    uncertainty: 'high',
  };
}

function alignEvidenceAssessments(
  assessments: InvestigatorOutput['claims'][number]['evidenceAssessments'],
  claimEvidence: Evidence[],
  allEvidence: Evidence[],
): InvestigatorOutput['claims'][number]['evidenceAssessments'] {
  if (!claimEvidence.length) return [];

  const byId = new Map(assessments.map((item) => [item.evidenceId, item]));
  const used = new Set<string>();
  const ordered = assessments.filter((item) =>
    allEvidence.some((evidence) => evidence.id === item.evidenceId),
  );

  return claimEvidence.map((evidence, index) => {
    let match = byId.get(evidence.id);
    if (!match) {
      match = ordered.find((item) => !used.has(item.evidenceId));
    }
    if (!match && assessments[index]) {
      match = assessments[index];
    }
    if (match) used.add(match.evidenceId);
    return {
      evidenceId: evidence.id,
      direction: match?.direction ?? EvidenceDirection.NEUTRAL,
      qualityScore: match?.qualityScore ?? 50,
    };
  });
}

export function alignInvestigatorOutput(
  raw: InvestigatorOutput,
  claims: Claim[],
  evidence: Evidence[],
): InvestigatorOutput {
  if (!claims.length) return { claims: [] };

  const byId = new Map(raw.claims.map((item) => [item.claimId, item]));
  const unused = raw.claims.filter((item) => !claims.some((claim) => claim.id === item.claimId));

  const aligned = claims.map((claim) => {
    let entry = byId.get(claim.id);
    if (!entry) entry = unused.shift();
    if (!entry) entry = defaultClaimAssessment(claim.id);

    const claimEvidence = evidence.filter((item) => item.claimId === claim.id);
    return {
      ...entry,
      claimId: claim.id,
      supportProbability: entry.supportProbability,
      confidence: entry.confidence,
      verdictSuggestion: entry.verdictSuggestion,
      reasoningSummary: entry.reasoningSummary || '',
      missingContext: entry.missingContext || [],
      uncertainty: entry.uncertainty || '',
      evidenceAssessments: alignEvidenceAssessments(
        entry.evidenceAssessments || [],
        claimEvidence,
        evidence,
      ),
    };
  });

  return { claims: aligned };
}

export function alignAdversarialOutput(
  raw: AdversarialOutput,
  claims: Claim[],
): AdversarialOutput {
  if (!claims.length) return { challenges: [] };
  const claimIds = new Set(claims.map((claim) => claim.id));
  const fallbackId = claims[0].id;

  return {
    challenges: raw.challenges.map((challenge, index) => ({
      ...challenge,
      claimId: claimIds.has(challenge.claimId)
        ? challenge.claimId
        : claims[Math.min(index, claims.length - 1)]?.id || fallbackId,
      challenge: challenge.challenge || 'Unspecified challenge',
      resolution: challenge.resolution || '',
    })),
  };
}

export function alignNarrativeOutput(raw: NarrativeOutput, claims: Claim[]): NarrativeOutput {
  const byId = new Map(raw.claimReasoning.map((item) => [item.claimId, item]));
  const leftover = [...raw.claimReasoning];

  const claimReasoning = claims.map((claim, index) => {
    let entry = byId.get(claim.id);
    if (!entry) entry = leftover[index];
    return {
      claimId: claim.id,
      reasoningSummary: entry?.reasoningSummary || raw.summary || '',
    };
  });

  return {
    summary: raw.summary || 'Verification complete.',
    claimReasoning,
  };
}
