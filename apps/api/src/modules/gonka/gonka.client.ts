import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, isAxiosError } from 'axios';
import { GonkaChatRequest, GonkaChatResponse, GonkaCompletion } from './gonka.types';

/**
 * Real HTTP client for the Gonka Router gateway.
 *
 * This is NOT a mock. It performs live calls against the configured
 * GONKA_ROUTER_URL using the provided GONKA_API_KEY. If credentials are
 * absent it fails loudly rather than returning fabricated data — the
 * ConsensusService must never receive invented model output.
 */
@Injectable()
export class GonkaClient {
  private readonly logger = new Logger(GonkaClient.name);
  private readonly http: AxiosInstance;

  constructor(private readonly config: ConfigService) {
    const baseURL = this.config.get<string>('GONKA_ROUTER_URL', 'https://gonkarouter.io');
    const apiKey = this.config.get<string>('GONKA_API_KEY');

    this.http = axios.create({
      baseURL,
      timeout: Number(this.config.get('GONKA_TIMEOUT_MS', 45000)),
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
    });
  }

  /**
   * Send a single chat-completion request to a specific model via Gonka.
   * Returns the raw text content plus the Gonka request id.
   *
   * NOTE: The endpoint path below (`/v1/chat/completions`) follows Gonka's
   * OpenAI-compatible router convention. Verify against gonkarouter.io docs.
   */
  async chat(
    model: string,
    messages: GonkaChatRequest['messages'],
    options: { json?: boolean; temperature?: number } = {},
  ): Promise<GonkaCompletion> {
    if (!this.config.get('GONKA_API_KEY')) {
      throw new HttpException(
        'GONKA_API_KEY is not configured — cannot perform real inference.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const payload: GonkaChatRequest = {
      model,
      messages,
      temperature: options.temperature ?? 0.2,
      ...(options.json ? { response_format: { type: 'json_object' } } : {}),
    };

    try {
      const { data, headers } = await this.http.post<GonkaChatResponse>(
        '/v1/chat/completions',
        payload,
      );

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new HttpException('Gonka returned an empty completion.', HttpStatus.BAD_GATEWAY);
      }

      // Gonka surfaces the request id either in the body or an x-request-id header.
      const requestId =
        data.id ?? (headers['x-request-id'] as string | undefined) ?? `gonka_${Date.now()}`;

      return { requestId, model: data.model ?? model, content };
    } catch (err) {
      if (isAxiosError(err)) {
        this.logger.error(`Gonka call failed for model=${model}: ${err.message}`);
        throw new HttpException(
          `Gonka Router error (${model}): ${err.response?.status ?? 'network'}`,
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw err;
    }
  }
}
