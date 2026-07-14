import { z } from 'zod';
import { EvidenceDirection, Verdict } from '../../entities';
export const visualSchema = z.object({
  visibleText: z.string(),
  entities: z.array(z.string()),
  dates: z.array(z.string()),
  numbers: z.array(z.string()),
  logos: z.array(z.string()),
  sceneDescription: z.string(),
});
export const claimExtractionSchema = z.object({
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
});
export const evidenceAssessmentSchema = z.object({
  evidenceId: z.string().uuid(),
  direction: z.nativeEnum(EvidenceDirection),
  qualityScore: z.number().min(0).max(100),
});
export const investigatorSchema = z.object({
  claims: z
    .array(
      z.object({
        claimId: z.string().uuid(),
        supportProbability: z.number().min(0).max(100),
        confidence: z.number().min(0).max(100),
        verdictSuggestion: z.nativeEnum(Verdict),
        reasoningSummary: z.string(),
        evidenceAssessments: z.array(evidenceAssessmentSchema),
        missingContext: z.array(z.string()),
        uncertainty: z.string(),
      }),
    )
    .min(1)
    .max(5),
});
export const adversarialSchema = z.object({
  challenges: z
    .array(
      z.object({
        claimId: z.string().uuid(),
        challenge: z.string(),
        severity: z.number().min(0).max(100),
        resolved: z.boolean(),
        resolution: z.string(),
      }),
    )
    .max(20),
});
export const narrativeSchema = z.object({
  summary: z.string().min(1).max(2000),
  claimReasoning: z.array(
    z.object({ claimId: z.string().uuid(), reasoningSummary: z.string().max(1000) }),
  ),
});
export type VisualOutput = z.infer<typeof visualSchema>;
export type ExtractedClaims = z.infer<typeof claimExtractionSchema>;
export type InvestigatorOutput = z.infer<typeof investigatorSchema>;
export type AdversarialOutput = z.infer<typeof adversarialSchema>;
export type NarrativeOutput = z.infer<typeof narrativeSchema>;
