export type InputType = 'text' | 'url' | 'image' | 'tweet' | string;

export type Verdict =
  'supported' | 'unverified' | 'misleading' | 'contradicted' | 'unverifiable' | string;

/** Canonical backend passport payload shape (after mapping). */

export interface PassportEvidence {
  id: string;
  claimId: string;
  title: string;
  url: string;
  domain: string;
  excerpt: string;
  publishedAt: string | null;
  retrievedAt: string | null;
  direction: string;
  relevanceScore: number;
  sourceQualityScore: number;
  contentHash: string;
}

export interface PassportClaim {
  id: string;
  text: string;
  importance: number;
  truthScore: number;
  confidenceScore: number;
  verdict: Verdict;
  reasoningSummary: string;
  claimHash: string;
  evidence: PassportEvidence[];
}

export interface PassportModelResponse {
  model: string;
  modelId: string;
  score: number;
  confidence: number;
  verdict: string;
  reasoning: string;
  requestId: string | null;
}

export interface AdversarialChallenge {
  claimId: string;
  challenge: string;
  severity: number;
  resolved: boolean;
  resolution?: string | null;
}

export interface ConsensusResult {
  truthScore: number;
  confidenceScore: number;
  verdict: Verdict;
  agreement: number;
  disagreement: boolean;
  disagreements: string[];
  summary: string;
  adversarialChallenges: AdversarialChallenge[];
}

export interface Attestation {
  status?: string;
  network?: string;
  contractAddress?: string | null;
  transactionHash: string | null;
  blockNumber: string | null;
  chainId: number | null;
  attestor?: string | null;
  explorerUrl?: string | null;
}

export interface PassportIntegrity {
  claimsRoot: string;
  evidenceRoot: string;
  kimiOutputHash: string;
  minimaxOutputHash: string;
  requestIdsHash: string;
  passportHash: string;
}

export interface PassportInput {
  type: InputType;
  displayText: string;
  sourceUrl: string | null;
  imageUrl: string | null;
  inputHash: string;
}

export interface Passport {
  publicId: string;
  verificationId: string;
  version: number;
  schemaVersion: string;
  input: PassportInput;
  truthScore: number;
  confidenceScore: number;
  verdict: Verdict;
  summary: string;
  claims: PassportClaim[];
  evidence: PassportEvidence[];
  consensus: ConsensusResult;
  modelResponses: PassportModelResponse[];
  requestIds: string[];
  integrity: PassportIntegrity;
  passportHash: string;
  attestation: Attestation | null;
  generatedAt: string;
}

export interface PassportListResponse {
  items: Passport[];
  nextCursor: string | null;
}

export interface IntegrityCheckResult {
  valid: boolean;
  recomputed: Record<string, string>;
  stored: Record<string, string>;
  onChain: Record<string, unknown> | null;
  matches: Record<string, boolean | Record<string, boolean> | null>;
}

export interface VerifyInput {
  inputType: InputType;
  input: string;
  walletAddress?: string;
}

export type VerificationStage =
  | 'CACHE_HIT'
  | 'INGESTION'
  | 'CLAIM_EXTRACTION'
  | 'EVIDENCE_RETRIEVAL'
  | 'INVESTIGATION'
  | 'ADVERSARIAL_REVIEW'
  | 'FINAL_NARRATIVE'
  | 'PASSPORT_CREATION'
  | 'ATTESTATION'
  | 'COMPLETED'
  | 'FAILED';

export interface VerificationProgress {
  stage: VerificationStage;
  elapsedMs: number;
}
