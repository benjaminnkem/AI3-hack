import axios from 'axios';
import { Passport, VerifyInput } from './types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
});

export interface HistoryRow {
  id: string;
  inputType: string;
  status: string;
  truthScore: number | null;
  createdAt: string;
  passport?: { publicId: string } | null;
}

function mapToPassport(data: any): Passport {
  if (data.verification) {
    const v = data.verification;
    const modelResponses = (v.modelResponses || []).map((m: any) => ({
      model: m.model,
      score: typeof m.confidence === 'number' ? m.confidence : (m.score ?? 0),
      reasoning: m.reasoning || '',
      requestId: m.requestId || null,
    }));
    
    const scores = modelResponses.map((m: any) => m.score);
    const mean = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    const stdDev = scores.length > 1 ? Math.sqrt(scores.reduce((acc: number, x: number) => acc + (x - mean) ** 2, 0) / scores.length) : 0;
    const disagreement = stdDev > 20;
    const agreement = 1 - Math.min(stdDev / 50, 1);
    const decisiveness = Math.abs(mean - 50) / 50;
    const confidence = agreement * (0.5 + 0.5 * decisiveness);

    let verdict = v.verdict;
    if (!verdict) {
      const truthScore = v.truthScore ?? 0;
      if (disagreement && truthScore > 35 && truthScore < 65) verdict = 'mixed';
      else if (truthScore >= 85) verdict = 'true';
      else if (truthScore >= 65) verdict = 'likely_true';
      else if (truthScore >= 45) verdict = 'mixed';
      else if (truthScore >= 25) verdict = 'likely_false';
      else if (truthScore >= 5) verdict = 'false';
      else verdict = 'unverifiable';
    }

    return {
      publicId: data.publicId,
      verificationId: v.id,
      inputType: v.inputType,
      originalInput: v.originalInput,
      truthScore: v.truthScore ?? 0,
      verdict: verdict,
      summary: v.summary || '',
      claims: (v.claims || []).map((c: any) => ({
        claim: c.claim,
        confidence: c.confidence ?? 0,
        status: c.status || 'unverifiable',
      })),
      consensus: {
        truthScore: v.truthScore ?? 0,
        verdict: verdict,
        agreement: agreement,
        confidence: confidence,
        disagreement: disagreement,
        summary: v.summary || '',
      },
      modelResponses: modelResponses,
      requestIds: modelResponses.map((m: any) => m.requestId).filter(Boolean),
      passportHash: data.passportHash,
      attestation: data.attestations && data.attestations.length > 0 ? {
        transactionHash: data.attestations[0].transactionHash,
        blockNumber: data.attestations[0].blockNumber,
        chainId: data.attestations[0].chainId,
      } : null,
      timestamp: data.createdAt,
    };
  }

  return {
    publicId: data.publicId,
    verificationId: data.verificationId,
    inputType: data.inputType || 'text',
    originalInput: data.originalInput,
    truthScore: data.truthScore ?? 0,
    verdict: data.verdict || 'unverifiable',
    summary: data.summary || '',
    claims: (data.claims || []).map((c: any) => ({
      claim: c.claim ?? c.text,
      confidence: c.confidence ?? 0,
      status: c.status || 'unverifiable',
    })),
    consensus: data.consensus || {
      truthScore: data.truthScore ?? 0,
      verdict: data.verdict || 'unverifiable',
      agreement: 1,
      confidence: 1,
      disagreement: false,
      summary: data.summary || '',
    },
    modelResponses: (data.modelResponses || []).map((m: any) => ({
      model: m.model,
      score: m.score ?? m.confidence ?? 0,
      reasoning: m.reasoning || '',
      requestId: m.requestId || null,
    })),
    requestIds: data.requestIds || [],
    passportHash: data.passportHash,
    attestation: data.attestation ? {
      transactionHash: data.attestation.transactionHash,
      blockNumber: data.attestation.blockNumber,
      chainId: data.attestation.chainId,
    } : null,
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

export async function verify(input: VerifyInput): Promise<Passport> {
  const { data } = await api.post('/api/verify', input);
  return mapToPassport(data);
}

export async function getPassport(publicId: string): Promise<Passport> {
  const { data } = await api.get(`/api/passports/${publicId}`);
  return mapToPassport(data);
}

export async function getHistory(): Promise<HistoryRow[]> {
  const { data } = await api.get<HistoryRow[]>('/api/history');
  return data;
}
