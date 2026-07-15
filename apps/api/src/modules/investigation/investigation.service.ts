import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Claim, Evidence } from '../../entities';
import { GonkaClient } from '../gonka/gonka.client';
import { GonkaResult } from '../gonka/gonka.types';
import { alignAdversarialOutput, alignInvestigatorOutput, alignNarrativeOutput } from './align';
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
      instructions: {
        claimIdSource: 'claims[].id',
        evidenceIdSource: 'evidence[].id',
        directionEnum: ['SUPPORTS', 'OPPOSES', 'NEUTRAL'],
        verdictEnum: ['SUPPORTED', 'UNVERIFIED', 'MISLEADING', 'CONTRADICTED'],
      },
    });

    const contentBlocks = [{ type: 'text' as const, text: packet }];

    const [kimi, minimax] = await Promise.all([
      this.gonka.structured(
        {
          model: this.config.get('GONKA_KIMI_MODEL', 'moonshotai/Kimi-K2.6'),
          maxTokens: this.config.get('GONKA_INVESTIGATOR_MAX_TOKENS', 3072),
          system: prompts.investigator,
          content: contentBlocks,
        },
        investigatorSchema,
      ),
      this.gonka.structured(
        {
          model: this.config.get('GONKA_MINIMAX_MODEL', 'MiniMaxAI/MiniMax-M2.7'),
          maxTokens: this.config.get('GONKA_INVESTIGATOR_MAX_TOKENS', 3072),
          system: prompts.investigator,
          content: contentBlocks,
        },
        investigatorSchema,
      ),
    ]);

    return {
      kimi: alignInvestigatorOutput(kimi.data, claims, evidence),
      minimax: alignInvestigatorOutput(minimax.data, claims, evidence),
      audits: [kimi.audit, minimax.audit],
    };
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
        maxTokens: this.config.get('GONKA_ADVERSARIAL_MAX_TOKENS', 2048),
        system: prompts.adversarial,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              content,
              claims: claims.map(({ id, text }) => ({ id, text })),
              evidence: evidence.map(({ id, claimId, title, url, domain, excerpt }) => ({
                id,
                claimId,
                title,
                url,
                domain,
                excerpt,
              })),
              kimi,
              minimax,
            }),
          },
        ],
      },
      adversarialSchema,
    );
    return {
      output: alignAdversarialOutput(result.data, claims),
      audit: result.audit,
    };
  }

  async narrative(payload: {
    immutableResult: unknown;
    claims: Array<{ id: string; text: string } & Record<string, unknown>>;
    challenges: unknown[];
  }): Promise<{ output: NarrativeOutput; audit: GonkaResult }> {
    const result = await this.gonka.structured(
      {
        model: this.config.get('GONKA_MINIMAX_MODEL', 'MiniMaxAI/MiniMax-M2.7'),
        maxTokens: this.config.get('GONKA_NARRATIVE_MAX_TOKENS', 1536),
        system: prompts.narrative,
        content: [{ type: 'text', text: JSON.stringify(payload) }],
      },
      narrativeSchema,
    );

    const claims = payload.claims.map((claim) => ({ id: claim.id }) as Claim);
    return {
      output: alignNarrativeOutput(result.data, claims),
      audit: result.audit,
    };
  }
}
