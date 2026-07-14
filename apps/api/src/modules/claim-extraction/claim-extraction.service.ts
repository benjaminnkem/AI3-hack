import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GonkaClient } from '../gonka/gonka.client';
import { GonkaResult } from '../gonka/gonka.types';
import { claimExtractionSchema, ExtractedClaims } from '../investigation/schemas';
import { prompts } from '../investigation/prompts';
@Injectable()
export class ClaimExtractionService {
  constructor(
    private readonly gonka: GonkaClient,
    private readonly config: ConfigService,
  ) {}
  async extract(content: string): Promise<{ output: ExtractedClaims; audit: GonkaResult }> {
    const result = await this.gonka.structured(
      {
        model: this.config.get('GONKA_MINIMAX_MODEL', 'MiniMaxAI/MiniMax-M2.7'),
        system: prompts.claims,
        content: [{ type: 'text', text: content.slice(0, 12000) }],
      },
      claimExtractionSchema,
    );
    return { output: result.data, audit: result.audit };
  }
}
