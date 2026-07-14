import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GonkaClient } from '../gonka/gonka.client';

export interface ExtractedClaim {
  claim: string;
  confidence: number;
}

/**
 * Uses a Gonka-routed model to extract discrete, checkable factual claims
 * from arbitrary input text. Real inference — no canned claims.
 */
@Injectable()
export class ClaimExtractionService {
  private readonly logger = new Logger(ClaimExtractionService.name);

  // Extraction is single-model; verification is where multi-model consensus applies.
  private static readonly EXTRACTION_MODEL = 'kimi';

  constructor(private readonly gonka: GonkaClient) {}

  async extract(text: string): Promise<ExtractedClaim[]> {
    const system =
      'You extract discrete, individually verifiable factual claims from text. ' +
      'Return ONLY JSON: {"claims":[{"claim":string,"confidence":number}]} ' +
      'where confidence (0-1) reflects how checkable the claim is. Ignore opinions.';

    const completion = await this.gonka.chat(
      ClaimExtractionService.EXTRACTION_MODEL,
      [
        { role: 'system', content: system },
        { role: 'user', content: text.slice(0, 8000) },
      ],
      { json: true },
    );

    try {
      const parsed = JSON.parse(completion.content) as { claims?: ExtractedClaim[] };
      const claims = (parsed.claims ?? []).filter((c) => c.claim?.trim().length > 0);
      if (claims.length === 0) {
        throw new HttpException('No verifiable claims found in input.', HttpStatus.UNPROCESSABLE_ENTITY);
      }
      return claims.map((c) => ({ claim: c.claim.trim(), confidence: this.clamp01(c.confidence) }));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Failed to parse claim extraction output: ${completion.content}`);
      throw new HttpException('Claim extraction returned malformed data.', HttpStatus.BAD_GATEWAY);
    }
  }

  private clamp01(x: number): number {
    if (typeof x !== 'number' || Number.isNaN(x)) return 0.5;
    return Math.min(1, Math.max(0, x));
  }
}
