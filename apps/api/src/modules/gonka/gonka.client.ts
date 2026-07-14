import Anthropic from '@anthropic-ai/sdk';
import { HttpException, HttpStatus, Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodSchema } from 'zod';
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
        if ((status === 429 || (status !== undefined && status >= 500)) && retry < maxRetries) {
          await this.delay(
            Math.min(
              60000,
              this.config.get<number>('GONKA_RETRY_BASE_MS', 30000) * 2 ** retry +
                Math.floor(Math.random() * 1000),
            ),
          );
          continue;
        }
        if (status === 401 || status === 403)
          throw new HttpException('Gonka authentication failed', HttpStatus.BAD_GATEWAY);
        if (status === 400 || status === 404)
          throw new HttpException(
            `Gonka rejected model or request (${request.model})`,
            HttpStatus.BAD_GATEWAY,
          );
        if (error instanceof HttpException) throw error;
        throw new HttpException(
          `Gonka request failed for ${request.model}`,
          status === 408 ? HttpStatus.GATEWAY_TIMEOUT : HttpStatus.BAD_GATEWAY,
        );
      }
    }
  }
  async structured<T>(
    request: GonkaRequest,
    schema: ZodSchema<T>,
  ): Promise<{ data: T; audit: GonkaResult; repaired: boolean }> {
    const first = await this.complete(request);
    const parsed = this.tryParse(first.text, schema);
    if (parsed.success) return { data: parsed.data, audit: first, repaired: false };
    const repair = await this.complete({
      ...request,
      system: `${request.system}\nRepair the supplied invalid response. Return JSON only, preserving meaning and satisfying the schema. Do not add unsupported facts.`,
      content: [
        {
          type: 'text',
          text: `Validation errors:\n${parsed.error}\n\nInvalid response:\n${first.text}`,
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
    schema: ZodSchema<T>,
  ): { success: true; data: T } | { success: false; error: string } {
    try {
      const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const candidate = fenced?.[1] ?? text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
      const result = schema.safeParse(JSON.parse(candidate));
      return result.success
        ? { success: true, data: result.data }
        : { success: false, error: result.error.message };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
    }
  }
  private status(error: unknown): number | undefined {
    return typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof error.status === 'number'
      ? error.status
      : undefined;
  }
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private isInjectedForTests(): boolean {
    return this.config.get('NODE_ENV') === 'test';
  }
}
