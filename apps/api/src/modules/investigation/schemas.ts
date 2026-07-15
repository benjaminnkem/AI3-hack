import { z } from 'zod';
import { EvidenceDirection, Verdict } from '../../entities';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  return Math.round(clampNumber(value, min, max, fallback));
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value == null) return fallback;
  return String(value);
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', 'yes', '1'].includes(v)) return true;
    if (['false', 'no', '0'].includes(v)) return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

function pick(obj: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  return undefined;
}

function normalizeDirection(value: unknown): EvidenceDirection {
  const raw = asString(value, 'NEUTRAL').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (['SUPPORT', 'SUPPORTS', 'SUPPORTING', 'FOR', 'CONFIRM', 'CONFIRMS'].includes(raw)) {
    return EvidenceDirection.SUPPORTS;
  }
  if (
    ['OPPOSE', 'OPPOSES', 'OPPOSING', 'AGAINST', 'CONTRADICT', 'CONTRADICTS', 'REFUTE', 'REFUTES'].includes(
      raw,
    )
  ) {
    return EvidenceDirection.OPPOSES;
  }
  return EvidenceDirection.NEUTRAL;
}

function normalizeVerdict(value: unknown): Verdict {
  const raw = asString(value, 'UNVERIFIED').trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (['SUPPORTED', 'SUPPORT', 'TRUE', 'LIKELY_TRUE', 'CONFIRMED'].includes(raw)) {
    return Verdict.SUPPORTED;
  }
  if (['MISLEADING', 'LIKELY_FALSE', 'PARTIALLY_FALSE', 'MIXED_FALSE'].includes(raw)) {
    return Verdict.MISLEADING;
  }
  if (['CONTRADICTED', 'FALSE', 'REFUTED', 'DEBUNKED'].includes(raw)) {
    return Verdict.CONTRADICTED;
  }
  return Verdict.UNVERIFIED;
}

function score0to100(value: unknown, fallback = 50): number {
  const n = clampNumber(value, -Infinity, Infinity, fallback);
  if (n >= 0 && n <= 1) return Math.round(n * 100);
  return clampInt(n, 0, 100, fallback);
}

export const visualSchema = z.preprocess((input) => {
  const obj = asRecord(input);
  return {
    visibleText: asString(pick(obj, ['visibleText', 'visible_text', 'text']), ''),
    entities: asArray(pick(obj, ['entities', 'namedEntities'])).map((item) => asString(item)),
    dates: asArray(pick(obj, ['dates'])).map((item) => asString(item)),
    numbers: asArray(pick(obj, ['numbers'])).map((item) => asString(item)),
    logos: asArray(pick(obj, ['logos'])).map((item) => asString(item)),
    sceneDescription: asString(
      pick(obj, ['sceneDescription', 'scene_description', 'scene']),
      '',
    ),
  };
}, z.object({
  visibleText: z.string(),
  entities: z.array(z.string()),
  dates: z.array(z.string()),
  numbers: z.array(z.string()),
  logos: z.array(z.string()),
  sceneDescription: z.string(),
}));

export const claimExtractionSchema = z.preprocess((input) => {
  const obj = asRecord(input);
  const claims = asArray(pick(obj, ['claims', 'atomicClaims', 'extractedClaims']))
    .map((item) => {
      const claim = asRecord(item);
      const text = asString(pick(claim, ['text', 'claim', 'statement'])).trim();
      const normalizedText = asString(
        pick(claim, ['normalizedText', 'normalized_text', 'normalized']),
        text,
      ).trim();
      const queries = asArray(pick(claim, ['searchQueries', 'search_queries', 'queries']))
        .map((q) => asString(q).trim())
        .filter(Boolean)
        .slice(0, 3);
      return {
        text,
        normalizedText: normalizedText || text,
        importance: clampInt(pick(claim, ['importance', 'priority', 'weight']), 1, 5, 3),
        context: asString(pick(claim, ['context', 'background']), ''),
        dateSensitive: asBoolean(pick(claim, ['dateSensitive', 'date_sensitive', 'timeSensitive']), false),
        searchQueries: queries.length ? queries : text ? [text.slice(0, 120)] : ['factual claim verification'],
      };
    })
    .filter((claim) => claim.text.length > 0)
    .slice(0, 5);

  return { claims };
}, z.object({
  claims: z
    .array(
      z.object({
        text: z.string().min(1),
        normalizedText: z.string().min(1),
        importance: z.number().int().min(1).max(5),
        context: z.string(),
        dateSensitive: z.boolean(),
        searchQueries: z.array(z.string().min(1)).min(1).max(3),
      }),
    )
    .max(5),
}));

export const evidenceAssessmentSchema = z.object({
  evidenceId: z.string().min(1),
  direction: z.nativeEnum(EvidenceDirection),
  qualityScore: z.number().min(0).max(100),
});

export const investigatorSchema = z.preprocess((input) => {
  const obj = asRecord(input);
  const claims = asArray(pick(obj, ['claims', 'claimAssessments', 'results'])).map((item) => {
    const claim = asRecord(item);
    const assessments = asArray(
      pick(claim, ['evidenceAssessments', 'evidence_assessments', 'evidence', 'sources']),
    )
      .map((assessment) => {
        const row = asRecord(assessment);
        const evidenceId = asString(
          pick(row, ['evidenceId', 'evidence_id', 'id', 'sourceId', 'source_id']),
        ).trim();
        if (!evidenceId) return null;
        return {
          evidenceId,
          direction: normalizeDirection(pick(row, ['direction', 'stance', 'polarity', 'supports'])),
          qualityScore: score0to100(pick(row, ['qualityScore', 'quality_score', 'quality', 'sourceQuality']), 50),
        };
      })
      .filter((row): row is { evidenceId: string; direction: EvidenceDirection; qualityScore: number } => row !== null);

    return {
      claimId: asString(pick(claim, ['claimId', 'claim_id', 'id']), '').trim() || 'unknown',
      supportProbability: score0to100(
        pick(claim, [
          'supportProbability',
          'support_probability',
          'score',
          'probability',
          'truthScore',
          'support',
        ]),
        50,
      ),
      confidence: score0to100(
        pick(claim, ['confidence', 'confidenceScore', 'confidence_score', 'certainty']),
        50,
      ),
      verdictSuggestion: normalizeVerdict(
        pick(claim, ['verdictSuggestion', 'verdict_suggestion', 'verdict', 'status']),
      ),
      reasoningSummary: asString(
        pick(claim, ['reasoningSummary', 'reasoning_summary', 'reasoning', 'explanation']),
        '',
      ),
      evidenceAssessments: assessments,
      missingContext: asArray(pick(claim, ['missingContext', 'missing_context', 'gaps'])).map((item) =>
        asString(item),
      ),
      uncertainty: asString(pick(claim, ['uncertainty', 'uncertaintyNotes']), ''),
    };
  });

  return { claims };
}, z.object({
  claims: z
    .array(
      z.object({
        claimId: z.string().min(1),
        supportProbability: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        verdictSuggestion: z.nativeEnum(Verdict),
        reasoningSummary: z.string(),
        evidenceAssessments: z.array(evidenceAssessmentSchema),
        missingContext: z.array(z.string()),
        uncertainty: z.string(),
      }),
    )
    .max(20),
}));

export const adversarialSchema = z.preprocess((input) => {
  const obj = asRecord(input);
  const challenges = asArray(pick(obj, ['challenges', 'adversarialChallenges', 'issues']))
    .map((item) => {
      const row = asRecord(item);
      return {
        claimId: asString(pick(row, ['claimId', 'claim_id', 'id']), '').trim() || 'unknown',
        challenge: asString(pick(row, ['challenge', 'issue', 'text', 'description']), ''),
        severity: score0to100(pick(row, ['severity', 'score', 'weight']), 50),
        resolved: asBoolean(pick(row, ['resolved', 'isResolved']), false),
        resolution: asString(pick(row, ['resolution', 'fix', 'response']), ''),
      };
    })
    .filter((row) => row.challenge.length > 0)
    .slice(0, 20);

  return { challenges };
}, z.object({
  challenges: z
    .array(
      z.object({
        claimId: z.string().min(1),
        challenge: z.string(),
        severity: z.number().min(0).max(100),
        resolved: z.boolean(),
        resolution: z.string(),
      }),
    )
    .max(20),
}));

export const narrativeSchema = z.preprocess((input) => {
  const obj = asRecord(input);
  const claimReasoning = asArray(pick(obj, ['claimReasoning', 'claim_reasoning', 'claims'])).map(
    (item) => {
      const row = asRecord(item);
      return {
        claimId: asString(pick(row, ['claimId', 'claim_id', 'id']), '').trim() || 'unknown',
        reasoningSummary: asString(
          pick(row, ['reasoningSummary', 'reasoning_summary', 'reasoning', 'summary']),
          '',
        ).slice(0, 1000),
      };
    },
  );

  return {
    summary: asString(pick(obj, ['summary', 'overview', 'narrative']), '').slice(0, 2000),
    claimReasoning,
  };
}, z.object({
  summary: z.string().min(1).max(2000),
  claimReasoning: z.array(
    z.object({ claimId: z.string().min(1), reasoningSummary: z.string().max(1000) }),
  ),
}));

export type VisualOutput = z.infer<typeof visualSchema>;
export type ExtractedClaims = z.infer<typeof claimExtractionSchema>;
export type InvestigatorOutput = z.infer<typeof investigatorSchema>;
export type AdversarialOutput = z.infer<typeof adversarialSchema>;
export type NarrativeOutput = z.infer<typeof narrativeSchema>;
