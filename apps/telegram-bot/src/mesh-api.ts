import { apiUrl, env } from './config';

export type MeshInputType = 'TEXT' | 'URL' | 'IMAGE';

export interface MeshPassportResult {
  publicId: string;
  truthScore: number;
  confidenceScore: number;
  verdict: string;
  summary: string;
}

function unwrap(body: unknown): any {
  if (body && typeof body === 'object' && 'success' in body) {
    const envelope = body as { success: boolean; data?: unknown; message?: string };
    if (!envelope.success) {
      throw new Error(envelope.message || 'Mesh API request failed');
    }
    return envelope.data;
  }
  return body;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body === 'object') {
      if ('message' in body && typeof (body as any).message === 'string') {
        return (body as any).message;
      }
      if ('error' in body && typeof (body as any).error === 'string') {
        return (body as any).error;
      }
    }
    return JSON.stringify(body).slice(0, 400);
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

function mapPassport(data: any): MeshPassportResult {
  return {
    publicId: data.publicId,
    truthScore: typeof data.truthScore === 'number' ? data.truthScore : 0,
    confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0,
    verdict: String(data.verdict || 'UNVERIFIED').toUpperCase(),
    summary: String(data.summary || '').trim(),
  };
}

export async function verifyText(content: string): Promise<MeshPassportResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.requestTimeoutMs);
  try {
    const response = await fetch(apiUrl('/verifications'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inputType: 'TEXT', content }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(await parseError(response));
    return mapPassport(unwrap(await response.json()));
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyUrl(url: string): Promise<MeshPassportResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.requestTimeoutMs);
  try {
    const response = await fetch(apiUrl('/verifications'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inputType: 'URL', url }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(await parseError(response));
    return mapPassport(unwrap(await response.json()));
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyImage(bytes: Uint8Array, filename: string, mimeType: string): Promise<MeshPassportResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.requestTimeoutMs);
  try {
    const form = new FormData();
    form.append('inputType', 'IMAGE');
    form.append('file', new Blob([Buffer.from(bytes)], { type: mimeType }), filename);

    const response = await fetch(apiUrl('/verifications'), {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(await parseError(response));
    return mapPassport(unwrap(await response.json()));
  } finally {
    clearTimeout(timer);
  }
}
