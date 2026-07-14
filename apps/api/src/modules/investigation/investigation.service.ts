import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Claim, Evidence } from '../../entities';
import { GonkaClient } from '../gonka/gonka.client';
import { GonkaResult } from '../gonka/gonka.types';
import {
  adversarialSchema,
  AdversarialOutput,
  investigatorSchema,
  InvestigatorOutput,
  narrativeSchema,
  NarrativeOutput,
} from './schemas';
import { prompts } from './prompts';
@Injectable()
export class InvestigationService {
  constructor(
    private readonly gonka: GonkaClient,
    private readonly config: ConfigService,
  ) {}
  async investigate(
    content: string,
    claims: Claim[],
    evidence: Evidence[],
    imageBlock?: {
      type: 'image';
      source: {
        type: 'base64';
        media_type: 'image/jpeg' | 'image/png' | 'image/webp';
        data: string;
      };
    },
  ): Promise<{ kimi: InvestigatorOutput; minimax: InvestigatorOutput; audits: GonkaResult[] }> {
    const packet = JSON.stringify({
      content,
      claims: claims.map(({ id, text }) => ({ id, text })),
      evidence: evidence.map(
        ({ id, claimId, title, url, domain, excerpt, publishedAt, tavilyRelevanceScore }) => ({
          id,
          claimId,
          title,
          url,
          domain,
          excerpt,
          publishedAt,
          relevance: tavilyRelevanceScore,
        }),
      ),
    });
    const kimiContent = imageBlock
      ? [imageBlock, { type: 'text' as const, text: packet }]
      : [{ type: 'text' as const, text: packet }];
    const [kimi, minimax] = await Promise.all([
      this.gonka.structured(
        {
          model: this.config.get('GONKA_KIMI_MODEL', 'moonshotai/Kimi-K2.6'),
          system: prompts.investigator,
          content: kimiContent,
        },
        investigatorSchema,
      ),
      this.gonka.structured(
        {
          model: this.config.get('GONKA_MINIMAX_MODEL', 'MiniMaxAI/MiniMax-M2.7'),
          system: prompts.investigator,
          content: [{ type: 'text', text: packet }],
        },
        investigatorSchema,
      ),
    ]);
    return { kimi: kimi.data, minimax: minimax.data, audits: [kimi.audit, minimax.audit] };
  }
  async adversarial(
    content: string,
    claims: Claim[],
    evidence: Evidence[],
    kimi: InvestigatorOutput,
    minimax: InvestigatorOutput,
  ): Promise<{ output: AdversarialOutput; audit: GonkaResult }> {
    const result = await this.gonka.structured(
      {
        model: this.config.get('GONKA_KIMI_MODEL', 'moonshotai/Kimi-K2.6'),
        system: prompts.adversarial,
        content: [
          { type: 'text', text: JSON.stringify({ content, claims, evidence, kimi, minimax }) },
        ],
      },
      adversarialSchema,
    );
    return { output: result.data, audit: result.audit };
  }
  async narrative(payload: unknown): Promise<{ output: NarrativeOutput; audit: GonkaResult }> {
    const result = await this.gonka.structured(
      {
        model: this.config.get('GONKA_MINIMAX_MODEL', 'MiniMaxAI/MiniMax-M2.7'),
        system: prompts.narrative,
        content: [{ type: 'text', text: JSON.stringify(payload) }],
      },
      narrativeSchema,
    );
    return { output: result.data, audit: result.audit };
  }
}
