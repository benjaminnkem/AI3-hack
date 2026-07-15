export type InputType = 'url' | 'tweet' | 'text' | 'image';

export interface ConsensusResult {
  truthScore: number;
  verdict: string;
  agreement: number;
  confidence: number;
  disagreement: boolean;
  summary: string;
}

export interface PassportClaim {
  claim: string;
  confidence: number;
  status: string;
}

export interface PassportModelResponse {
  model: string;
  score: number;
  reasoning: string;
  requestId: string | null;
}

export interface Attestation {
  status?: string;
  network?: string;
  contractAddress?: string;
  transactionHash: string | null;
  blockNumber: string | null;
  chainId: number | null;
  attestor?: string | null;
  explorerUrl?: string | null;
}

export interface Passport {
  publicId: string;
  verificationId: string;
  inputType: InputType;
  originalInput?: string;
  truthScore: number;
  verdict: string;
  summary: string;
  claims: PassportClaim[];
  consensus: ConsensusResult;
  modelResponses: PassportModelResponse[];
  requestIds: string[];
  passportHash: string;
  attestation: Attestation | null;
  timestamp: string;
}

export interface VerifyInput {
  inputType: InputType;
  input: string;
  walletAddress?: string;
}
