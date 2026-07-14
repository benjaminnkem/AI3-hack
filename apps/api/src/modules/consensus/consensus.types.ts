import { EvidenceDirection, Verdict } from '../../entities';
export interface ScoredEvidence {
  domain: string;
  relevance: number;
  direction: EvidenceDirection;
  kimiQuality: number;
  minimaxQuality: number;
}
export interface Challenge {
  severity: number;
  resolved: boolean;
}
export interface ClaimScoreInput {
  importance: number;
  kimiProbability: number;
  minimaxProbability: number;
  kimiConfidence: number;
  minimaxConfidence: number;
  evidence: ScoredEvidence[];
  challenges: Challenge[];
}
export interface ClaimScore {
  truthScore: number;
  confidenceScore: number;
  verdict: Verdict;
  evidenceScore: number;
  modelMean: number;
  disagreement: number;
  adversarialPenalty: number;
}
export interface OverallScore {
  truthScore: number;
  confidenceScore: number;
  verdict: Verdict;
}
