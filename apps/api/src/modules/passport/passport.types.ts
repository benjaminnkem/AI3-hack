import { ConsensusResult } from '../consensus/consensus.types';

export interface PassportModelResponse {
  model: string;
  score: number;
  reasoning: string;
  requestId: string | null;
}

export interface PassportClaim {
  claim: string;
  confidence: number;
  status: string;
}

/** The canonical passport document that gets hashed and anchored on-chain. */
export interface PassportDocument {
  version: string;
  verificationId: string;
  inputType: string;
  truthScore: number;
  verdict: string;
  summary: string;
  claims: PassportClaim[];
  consensus: ConsensusResult;
  modelResponses: PassportModelResponse[];
  requestIds: string[];
  timestamp: string;
}

export interface HashedPassport {
  document: PassportDocument;
  passportHash: string;
}
