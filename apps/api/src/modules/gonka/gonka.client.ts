import Anthropic from '@anthropic-ai/sdk';
import { HttpException, HttpStatus, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { GONKA_TRANSPORT, GonkaRequest, GonkaResult, GonkaTransport } from './gonka.types';

class AnthropicTransport implements GonkaTransport {
  constructor(private readonly client: Anthropic) {}
  async create(
    params: Anthropic.MessageCreateParamsNonStreaming,
    timeoutMs: number,
  ): Promise<{ message: Anthropic.Message; requestId?: string }> {
    const response = await this.client.messages
      .create(params, { timeout: timeoutMs })
      .withResponse();
    return {
      message: response.data,
      requestId:
        response.response.headers.get('request-id') ??
        response.response.headers.get('x-request-id') ??
        undefined,
    };
  }
}

@Injectable()
export class GonkaClient {
  private readonly logger = new Logger(GonkaClient.name);
  private readonly transport: GonkaTransport;
  constructor(
    private readonly config: ConfigService,
    @Optional() @Inject(GONKA_TRANSPORT) injected?: GonkaTransport,
  ) {
    const key = config.get<string>('GONKA_API_KEY');
    this.transport =
      injected ??
      new AnthropicTransport(
        new Anthropic({
          apiKey: key ?? 'missing',
          baseURL: config.get<string>('GONKA_BASE_URL', 'https://api.gonkarouter.io'),
        }),
      );
  }
  async complete(request: GonkaRequest): Promise<GonkaResult> {
    if (!this.config.get<string>('GONKA_API_KEY') && !this.isInjectedForTests())
      throw new HttpException('Gonka is not configured', HttpStatus.SERVICE_UNAVAILABLE);
    const maxTokens = request.maxTokens ?? this.config.get<number>('GONKA_MAX_TOKENS', 4096);
    if (maxTokens < 1024) throw new Error('Gonka max_tokens cannot be below 1024');
    const maxRetries = this.config.get<number>('GONKA_MAX_RETRIES', 2);
    const started = Date.now();
    for (let retry = 0; ; retry += 1) {
      try {
        const { message, requestId } = await this.transport.create(
          {
            model: request.model,
            max_tokens: maxTokens,
            system: request.system,
            messages: [{ role: 'user', content: request.content }],
          },
          request.timeoutMs ?? this.config.get<number>('GONKA_TIMEOUT_MS', 120000),
        );
        const text = GonkaClient.extractText(message.content);
        if (!text) throw new HttpException('Gonka returned no text blocks', HttpStatus.BAD_GATEWAY);
        this.logger.log(
          JSON.stringify({
            event: 'gonka.complete',
            model: request.model,
            responseId: message.id,
            latencyMs: Date.now() - started,
            retry,
          }),
        );
        return {
          modelId: request.model,
          text,
          responseId: message.id,
          providerRequestId: requestId ?? null,
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
          latencyMs: Date.now() - started,
          retryCount: retry,
        };
      } catch (error) {
        const status = this.status(error);
        const detail = this.errorDetail(error);
        this.logger.warn(
          JSON.stringify({
            event: 'gonka.error',
            model: request.model,
            status,
            detail,
            retry,
          }),
        );
        if ((status === 429 || (status !== undefined && status >= 500)) && retry < maxRetries) {
          await this.delay(this.retryDelay(error, retry));
          continue;
        }
        if (status === 401 || status === 403)
          throw new HttpException('Gonka authentication failed', HttpStatus.BAD_GATEWAY);
        if (status === 400 || status === 404)
          throw new HttpException(
            `Gonka rejected model or request (${request.model})${detail ? `: ${detail}` : ''}`,
            HttpStatus.BAD_GATEWAY,
          );
        if (error instanceof HttpException) throw error;
        throw new HttpException(
          `Gonka request failed for ${request.model}${detail ? `: ${detail}` : ''}`,
          status === 408 ? HttpStatus.GATEWAY_TIMEOUT : HttpStatus.BAD_GATEWAY,
        );
      }
    }
  }
  async structured<T>(
    request: GonkaRequest,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ): Promise<{ data: T; audit: GonkaResult; repaired: boolean }> {
    const first = await this.complete(request);
    const parsed = this.tryParse(first.text, schema);
    if (parsed.success) return { data: parsed.data, audit: first, repaired: false };

    const repair = await this.complete({
      ...request,
      system: `${request.system}\nRepair the supplied invalid response. Return a single valid JSON object only. No markdown. Preserve meaning. Fix enums to uppercase, numeric bounds, required arrays/fields, and UUID ids copied from the original user packet when present. Do not invent unsupported facts.`,
      content: [
        {
          type: 'text',
          text: `Validation errors:\n${parsed.error}\n\nInvalid response:\n${this.truncate(first.text, 12000)}`,
        },
      ],
    });
    const repaired = this.tryParse(repair.text, schema);
    if (!repaired.success)
      throw new HttpException(
        `Gonka structured output remained invalid after one repair: ${repaired.error}`,
        HttpStatus.BAD_GATEWAY,
      );
    repair.relatedAudits = [first];
    return { data: repaired.data, audit: repair, repaired: true };
  }
  static extractText(blocks: Anthropic.ContentBlock[]): string {
    return blocks
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();
  }
  private tryParse<T>(
    text: string,
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  ): { success: true; data: T } | { success: false; error: string } {
    const candidates = this.jsonCandidates(text);
    let lastError = 'Invalid JSON';
    for (const candidate of candidates) {
      try {
        const result = schema.safeParse(JSON.parse(candidate));
        if (result.success) return { success: true, data: result.data };
        lastError = result.error.message;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Invalid JSON';
      }
    }
    return { success: false, error: lastError };
  }
  private jsonCandidates(text: string): string[] {
    const cleaned = text
      .replace(/^\uFEFF/, '')
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();
    const candidates = new Set<string>();
    if (cleaned) candidates.add(cleaned);

    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]?.trim()) candidates.add(fenced[1].trim());

    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart >= 0 && objectEnd > objectStart) {
      candidates.add(cleaned.slice(objectStart, objectEnd + 1));
    }

    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');
    if (arrayStart >= 0 && arrayEnd > arrayStart) {
      const arraySlice = cleaned.slice(arrayStart, arrayEnd + 1);
      candidates.add(arraySlice);
      try {
        const parsed = JSON.parse(arraySlice);
        if (Array.isArray(parsed)) {
          candidates.add(JSON.stringify({ claims: parsed }));
          candidates.add(JSON.stringify({ challenges: parsed }));
        }
      } catch {
        // ignore malformed array slices
      }
    }

    return [...candidates];
  }
  private truncate(value: string, max: number): string {
    return value.length <= max ? value : `${value.slice(0, max)}...`;
  }
  private status(error: unknown): number | undefined {
    return typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number'
      ? error.status
      : undefined;
  }
  private errorDetail(error: unknown): string {
    if (!error || typeof error !== 'object') return '';
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message.trim()) {
      const match = record.message.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]) as {
            error?: { message?: string };
            message?: string;
          };
          return parsed.error?.message || parsed.message || record.message;
        } catch {
          return record.message;
        }
      }
      return record.message;
    }
    if (record.error && typeof record.error === 'object') {
      const nested = record.error as Record<string, unknown>;
      if (typeof nested.message === 'string') return nested.message;
    }
    return '';
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private retryDelay(error: unknown, retry: number): number {
    const retryAfter = this.retryAfterMs(error);
    if (retryAfter !== null) return Math.min(15000, retryAfter);
    return Math.min(
      15000,
      this.config.get<number>('GONKA_RETRY_BASE_MS', 2000) * 2 ** retry +
        Math.floor(Math.random() * 500),
    );
  }
  private retryAfterMs(error: unknown): number | null {
    if (!error || typeof error !== 'object' || !('headers' in error)) return null;
    const headers = error.headers;
    let value: unknown;
    if (headers instanceof Headers) value = headers.get('retry-after');
    else if (headers && typeof headers === 'object') {
      value = (headers as Record<string, unknown>)['retry-after'];
    }
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const at = Date.parse(String(value));
    return Number.isFinite(at) ? Math.max(0, at - Date.now()) : null;
  }
  private isInjectedForTests(): boolean {
    return this.config.get('NODE_ENV') === 'test';
  }
}
