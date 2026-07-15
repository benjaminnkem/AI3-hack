export type VerificationProgressStage =
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
  stage: VerificationProgressStage;
  elapsedMs: number;
}

export type VerificationProgressReporter = (progress: VerificationProgress) => void;
