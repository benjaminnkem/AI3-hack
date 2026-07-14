export interface ModelVerdict {
  model: string;
  /** 0-100 truthfulness score the model assigned to the claim set. */
  score: number;
  reasoning: string;
  requestId: string | null;
}

export enum Verdict {
  TRUE = 'true',
  LIKELY_TRUE = 'likely_true',
  MIXED = 'mixed',
  LIKELY_FALSE = 'likely_false',
  FALSE = 'false',
  UNVERIFIABLE = 'unverifiable',
}

export interface ConsensusResult {
  /** Final aggregate 0-100 truth score. */
  truthScore: number;
  verdict: Verdict;
  /** 0-1 measure of how much the models agreed. */
  agreement: number;
  /** 0-1 aggregate confidence, penalised when models disagree. */
  confidence: number;
  /** True when model scores diverge beyond the dispersion threshold. */
  disagreement: boolean;
  summary: string;
}
