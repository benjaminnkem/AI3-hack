import axios from 'axios';
import {
  IntegrityCheckResult,
  Passport,
  PassportClaim,
  PassportEvidence,
  PassportModelResponse,
  PassportListResponse,
  VerifyInput,
  InputType,
  Verdict,
  VerificationProgress,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        return body.data;
      } else {
        const error = new Error(body.message || 'Request failed') as any;
        error.code = body.code;
        error.traceId = body.traceId;
        error.details = body.details;
        return Promise.reject(error);
      }
    }
    return body;
  },
  (error) => {
    if (error.response?.data && typeof error.response.data === 'object') {
      const body = error.response.data;
      const message = body.message || error.message;
      const err = new Error(message) as any;
      err.code = body.code;
      err.traceId = body.traceId;
      err.details = body.details;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  },
);

/** @deprecated Prefer Passport from listPassports/getHistory */
export interface HistoryRow {
  id: string;
  publicId: string;
  inputType: string;
  status: string;
  truthScore: number | null;
  confidenceScore: number | null;
  verdict: string;
  summary: string;
  displayText: string;
  createdAt: string;
  claimCount: number;
  evidenceCount: number;
  attestationStatus: string | null;
  passport?: { publicId: string } | null;
}

function asVerdict(value: unknown): Verdict {
  return String(value || 'unverified').toLowerCase();
}

function mapEvidence(items: any[]): PassportEvidence[] {
  return (items || []).map((e: any) => ({
    id: e.id || '',
    claimId: e.claimId || '',
    title: e.title || 'Untitled source',
    url: e.url || e.canonicalUrl || '',
    domain: e.domain || '',
    excerpt: e.excerpt || '',
    publishedAt: e.publishedAt || null,
    retrievedAt: e.retrievedAt || null,
    direction: String(e.direction || 'NEUTRAL').toLowerCase(),
    relevanceScore:
      typeof e.relevanceScore === 'number'
        ? e.relevanceScore
        : typeof e.tavilyRelevanceScore === 'number'
          ? e.tavilyRelevanceScore
          : 0,
    sourceQualityScore: typeof e.sourceQualityScore === 'number' ? e.sourceQualityScore : 0,
    contentHash: e.contentHash || '',
  }));
}

function mapClaims(claims: any[], evidence: PassportEvidence[]): PassportClaim[] {
  return (claims || []).map((c: any) => {
    const id = c.id || '';
    return {
      id,
      text: c.text || c.claim || '',
      importance: typeof c.importance === 'number' ? c.importance : 1,
      truthScore: typeof c.truthScore === 'number' ? c.truthScore : 50,
      confidenceScore:
        typeof c.confidenceScore === 'number'
          ? c.confidenceScore
          : typeof c.confidence === 'number'
            ? c.confidence
            : 0,
      verdict: asVerdict(c.verdict || c.status),
      reasoningSummary: c.reasoningSummary || '',
      claimHash: c.claimHash || '',
      evidence: evidence.filter((item) => item.claimId === id),
    };
  });
}

function mapModelResponses(data: any, consensus: any): PassportModelResponse[] {
  const modelResponses: PassportModelResponse[] = [];

  if (consensus.kimi) {
    modelResponses.push({
      model: consensus.kimi.modelId || 'moonshotai/Kimi-K2.6',
      modelId: consensus.kimi.modelId || 'moonshotai/Kimi-K2.6',
      score: consensus.kimi.score ?? 0,
      confidence: consensus.kimi.confidence ?? 0,
      verdict: asVerdict(consensus.kimi.verdict),
      reasoning: consensus.kimi.reasoningSummary || '',
      requestId: consensus.kimi.gonkaResponseId || null,
    });
  }

  if (consensus.minimax) {
    modelResponses.push({
      model: consensus.minimax.modelId || 'MiniMaxAI/MiniMax-M2.7',
      modelId: consensus.minimax.modelId || 'MiniMaxAI/MiniMax-M2.7',
      score: consensus.minimax.score ?? 0,
      confidence: consensus.minimax.confidence ?? 0,
      verdict: asVerdict(consensus.minimax.verdict),
      reasoning: consensus.minimax.reasoningSummary || '',
      requestId: consensus.minimax.gonkaResponseId || null,
    });
  }

  if (modelResponses.length === 0 && Array.isArray(data.modelResponses)) {
    for (const m of data.modelResponses) {
      modelResponses.push({
        model: m.model || m.modelId || 'unknown',
        modelId: m.modelId || m.model || 'unknown',
        score: m.score ?? m.confidence ?? 0,
        confidence: m.confidence ?? 0,
        verdict: asVerdict(m.verdict),
        reasoning: m.reasoning || m.reasoningSummary || '',
        requestId: m.requestId || m.gonkaResponseId || null,
      });
    }
  }

  return modelResponses;
}

export function mapToPassport(data: any): Passport {
  const input = data.input || {};
  const consensus = data.modelConsensus || {};
  const integrity = data.integrity || {};
  const evidence = mapEvidence(data.evidence || []);
  const claims = mapClaims(data.claims || [], evidence);
  const modelResponses = mapModelResponses(data, consensus);
  const challenges = (consensus.adversarialChallenges || data.adversarialChallenges || []).map(
    (c: any) => ({
      claimId: c.claimId || '',
      challenge: c.challenge || c.issue || '',
      severity: typeof c.severity === 'number' ? c.severity : 0,
      resolved: Boolean(c.resolved),
      resolution: c.resolution ?? null,
    }),
  );
  const disagreements = Array.isArray(consensus.disagreements) ? consensus.disagreements : [];
  const agreement =
    typeof consensus.agreementScore === 'number'
      ? consensus.agreementScore
      : typeof consensus.agreement === 'number'
        ? consensus.agreement
        : 100;
  const confidenceScore =
    typeof data.confidenceScore === 'number'
      ? data.confidenceScore
      : typeof consensus.confidence === 'number'
        ? consensus.confidence
        : 0;
  const passportHash = integrity.passportHash || data.passportHash || '';
  const inputType = String(input.type || data.inputType || 'text').toLowerCase() as InputType;

  const attestation = data.attestation
    ? {
        status: data.attestation.status,
        network: data.attestation.network,
        contractAddress: data.attestation.contractAddress ?? null,
        transactionHash: data.attestation.transactionHash || null,
        blockNumber:
          data.attestation.blockNumber != null ? String(data.attestation.blockNumber) : null,
        chainId: data.attestation.chainId ?? null,
        attestor: data.attestation.attestor ?? null,
        explorerUrl: data.attestation.explorerUrl ?? null,
      }
    : null;

  return {
    publicId: data.publicId,
    verificationId: data.verificationId || '',
    version: typeof data.version === 'number' ? data.version : 1,
    schemaVersion: data.schemaVersion || '1.0.0',
    input: {
      type: inputType,
      displayText: input.displayText || data.originalInput || data.summary || '',
      sourceUrl: input.sourceUrl || null,
      imageUrl: input.imageUrl || null,
      inputHash: input.inputHash || '',
    },
    truthScore: typeof data.truthScore === 'number' ? data.truthScore : 0,
    confidenceScore,
    verdict: asVerdict(data.verdict),
    summary: data.summary || '',
    claims,
    evidence,
    consensus: {
      truthScore: typeof data.truthScore === 'number' ? data.truthScore : 0,
      confidenceScore,
      verdict: asVerdict(data.verdict),
      agreement,
      disagreement: disagreements.length > 0,
      disagreements,
      summary: data.summary || '',
      adversarialChallenges: challenges,
    },
    modelResponses,
    requestIds:
      data.requestIds || (modelResponses.map((m) => m.requestId).filter(Boolean) as string[]),
    integrity: {
      claimsRoot: integrity.claimsRoot || '',
      evidenceRoot: integrity.evidenceRoot || '',
      kimiOutputHash: integrity.kimiOutputHash || '',
      minimaxOutputHash: integrity.minimaxOutputHash || '',
      requestIdsHash: integrity.requestIdsHash || '',
      passportHash,
    },
    passportHash,
    attestation,
    generatedAt: data.generatedAt || data.timestamp || new Date().toISOString(),
  };
}

export async function verify(
  input: VerifyInput,
  onProgress?: (progress: VerificationProgress) => void,
): Promise<Passport> {
  const backendInputType = input.inputType.toUpperCase();
  let body: BodyInit;
  let headers: HeadersInit | undefined;

  if (backendInputType === 'IMAGE') {
    const formData = new FormData();
    formData.append('inputType', 'IMAGE');
    const response = await fetch(input.input);
    const blob = await response.blob();
    formData.append('file', blob, 'screenshot.png');
    body = formData;
  } else {
    body = JSON.stringify(
      backendInputType === 'URL'
        ? { inputType: 'URL', url: input.input }
        : { inputType: 'TEXT', content: input.input },
    );
    headers = { 'Content-Type': 'application/json' };
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/verifications/stream`, {
    method: 'POST',
    headers,
    body,
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(error?.message || `Verification request failed (${response.status})`);
  }
  if (!response.body) throw new Error('Verification stream was not available');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: unknown;

  const consume = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as {
      type?: string;
      stage?: VerificationProgress['stage'];
      elapsedMs?: number;
      data?: unknown;
      message?: string;
    };
    if (event.type === 'progress' && event.stage && typeof event.elapsedMs === 'number') {
      onProgress?.({ stage: event.stage, elapsedMs: event.elapsedMs });
    } else if (event.type === 'result') result = event.data;
    else if (event.type === 'error') throw new Error(event.message || 'Verification failed');
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) consume(line);
    if (done) break;
  }
  consume(buffer);
  if (!result) throw new Error('Verification completed without a passport');
  return mapToPassport(result);
}

export async function getPassport(publicId: string): Promise<Passport> {
  const res = (await api.get(`/api/v1/passports/${publicId}`)) as any;
  return mapToPassport(res);
}

export async function listPassports(params?: {
  cursor?: string;
  limit?: number;
  verdict?: string;
  inputType?: string;
}): Promise<PassportListResponse> {
  const res = (await api.get('/api/v1/passports', { params })) as any;
  const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
  return {
    items: items.map(mapToPassport),
    nextCursor: res?.nextCursor ?? null,
  };
}

export async function getHistory(): Promise<Passport[]> {
  const { items } = await listPassports({ limit: 50 });
  return items;
}

export async function verifyIntegrity(publicId: string): Promise<IntegrityCheckResult> {
  return (await api.get(`/api/v1/passports/${publicId}/integrity`)) as IntegrityCheckResult;
}

export async function retryAttestation(publicId: string): Promise<Passport> {
  const res = (await api.post(`/api/v1/passports/${publicId}/attest`)) as any;
  return mapToPassport(res);
}
