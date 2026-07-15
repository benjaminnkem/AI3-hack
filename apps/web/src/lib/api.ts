import axios from 'axios';
import { Passport, VerifyInput, InputType } from './types';

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:4000',
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

export interface HistoryRow {
  id: string;
  inputType: string;
  status: string;
  truthScore: number | null;
  createdAt: string;
  passport?: { publicId: string } | null;
}

function mapToPassport(data: any): Passport {
  const input = data.input || {};
  const consensus = data.modelConsensus || {};

  const claims = (data.claims || []).map((c: any) => ({
    claim: c.text || c.claim || '',
    confidence: typeof c.confidenceScore === 'number' ? c.confidenceScore : (c.confidence ?? 0),
    status: c.verdict || c.status || 'unverifiable',
  }));

  const modelResponses: any[] = [];
  if (consensus.kimi) {
    modelResponses.push({
      model: consensus.kimi.modelId || 'moonshotai/Kimi-K2.6',
      score: consensus.kimi.score ?? 0,
      reasoning: consensus.kimi.reasoningSummary || '',
      requestId: consensus.kimi.gonkaResponseId || null,
    });
  }
  if (consensus.minimax) {
    modelResponses.push({
      model: consensus.minimax.modelId || 'MiniMaxAI/MiniMax-M2.7',
      score: consensus.minimax.score ?? 0,
      reasoning: consensus.minimax.reasoningSummary || '',
      requestId: consensus.minimax.gonkaResponseId || null,
    });
  }

  if (modelResponses.length === 0 && data.modelResponses) {
    modelResponses.push(
      ...(data.modelResponses || []).map((m: any) => ({
        model: m.model,
        score: m.score ?? m.confidence ?? 0,
        reasoning: m.reasoning || '',
        requestId: m.requestId || null,
      })),
    );
  }

  const attestation = data.attestation
    ? {
        status: data.attestation.status,
        network: data.attestation.network,
        contractAddress: data.attestation.contractAddress,
        transactionHash: data.attestation.transactionHash || null,
        blockNumber: data.attestation.blockNumber ? String(data.attestation.blockNumber) : null,
        chainId: data.attestation.chainId || null,
        attestor: data.attestation.attestor || null,
        explorerUrl: data.attestation.explorerUrl || null,
      }
    : null;

  return {
    publicId: data.publicId,
    verificationId: data.verificationId || '',
    inputType: (input.type || data.inputType || 'text').toLowerCase() as InputType,
    originalInput: input.displayText || data.originalInput || '',
    truthScore: data.truthScore ?? 0,
    verdict: (data.verdict || 'unverifiable').toLowerCase(),
    summary: data.summary || '',
    claims,
    consensus: {
      truthScore: data.truthScore ?? 0,
      verdict: (data.verdict || 'unverifiable').toLowerCase(),
      agreement: typeof consensus.agreementScore === 'number' ? consensus.agreementScore : 100,
      confidence: typeof data.confidenceScore === 'number' ? data.confidenceScore : 100,
      disagreement: (consensus.disagreements || []).length > 0,
      summary: data.summary || '',
    },
    modelResponses,
    requestIds:
      data.requestIds || (modelResponses.map((m) => m.requestId).filter(Boolean) as string[]),
    passportHash: data.integrity?.passportHash || data.passportHash || '',
    attestation,
    timestamp: data.generatedAt || data.timestamp || new Date().toISOString(),
  };
}

export async function verify(input: VerifyInput): Promise<Passport> {
  const backendInputType = input.inputType.toUpperCase();

  if (backendInputType === 'IMAGE') {
    const formData = new FormData();
    formData.append('inputType', 'IMAGE');

    // Parse base64 data url into blob for multipart upload
    const response = await fetch(input.input);
    const blob = await response.blob();
    formData.append('file', blob, 'screenshot.png');

    const res = (await api.post('/api/v1/verifications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })) as any;
    return mapToPassport(res);
  } else if (backendInputType === 'URL') {
    const res = (await api.post('/api/v1/verifications', {
      inputType: 'URL',
      url: input.input,
    })) as any;
    return mapToPassport(res);
  } else {
    // TEXT / TWEET
    const res = (await api.post('/api/v1/verifications', {
      inputType: 'TEXT',
      content: input.input,
    })) as any;
    return mapToPassport(res);
  }
}

export async function getPassport(publicId: string): Promise<Passport> {
  const res = (await api.get(`/api/v1/passports/${publicId}`)) as any;
  return mapToPassport(res);
}

export async function getHistory(): Promise<HistoryRow[]> {
  const res = (await api.get('/api/v1/passports')) as any;
  const items = res.items || [];
  return items.map((item: any) => {
    const input = item.input || {};
    return {
      id: item.verificationId || item.publicId,
      inputType: (input.type || item.inputType || 'text').toLowerCase(),
      status: 'completed',
      truthScore: item.truthScore ?? null,
      createdAt: item.generatedAt || item.timestamp || new Date().toISOString(),
      passport: { publicId: item.publicId },
    };
  });
}

export async function verifyIntegrity(publicId: string): Promise<any> {
  return (await api.get(`/api/v1/passports/${publicId}/integrity`)) as any;
}

export async function retryAttestation(publicId: string): Promise<any> {
  return (await api.post(`/api/v1/passports/${publicId}/attest`)) as any;
}
