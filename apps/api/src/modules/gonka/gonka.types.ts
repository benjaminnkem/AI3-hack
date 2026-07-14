import Anthropic from '@anthropic-ai/sdk';

export const GONKA_TRANSPORT = Symbol('GONKA_TRANSPORT');
export interface GonkaTransport {
  create(
    params: Anthropic.MessageCreateParamsNonStreaming,
    timeoutMs: number,
  ): Promise<{ message: Anthropic.Message; requestId?: string }>;
}
export interface GonkaRequest {
  model: string;
  system: string;
  content: Anthropic.ContentBlockParam[];
  maxTokens?: number;
  timeoutMs?: number;
}
export interface GonkaResult {
  modelId: string;
  text: string;
  responseId: string;
  providerRequestId: string | null;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  retryCount: number;
  relatedAudits?: GonkaResult[];
}
