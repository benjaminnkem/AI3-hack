import { Injectable } from '@nestjs/common';
import { GonkaClient } from '../gonka/gonka.client';
import { ModelVerdict } from '../consensus/consensus.types';

/**
 * Runs the multi-model verification pass. Each configured model independently
 * scores the claim set through Gonka; results feed the ConsensusService.
 *
 * Two DIFFERENT LLMs (Kimi + MiniMax) satisfy the Track 3 cross-consensus
 * requirement. Add models to VERIFICATION_MODELS to widen the panel.
 */
@Injectable()
export class VerificationModelService {
  private static readonly VERIFICATION_MODELS = ['kimi', 'minimax'];

  constructor(private readonly gonka: GonkaClient) {}

  async runPanel(claims: string[]): Promise<ModelVerdict[]> {
    const claimBlock = claims.map((c, i) => `${i + 1}. ${c}`).join('\n');

    const system =
      'You are a rigorous fact-checker. Assess the factual accuracy of the numbered claims. ' +
      'Use your knowledge to judge truthfulness. Return ONLY JSON: ' +
      '{"score":number,"reasoning":string} where score is 0-100 (0 = entirely false, ' +
      '100 = entirely true) reflecting the overall truthfulness of the claim set.';

    // Run models concurrently — independent verdicts, no cross-contamination.
    const verdicts = await Promise.all(
      VerificationModelService.VERIFICATION_MODELS.map((model) =>
        this.scoreWithModel(model, system, claimBlock),
      ),
    );

    return verdicts;
  }

  private async scoreWithModel(
    model: string,
    system: string,
    claimBlock: string,
  ): Promise<ModelVerdict> {
    const completion = await this.gonka.chat(
      model,
      [
        { role: 'system', content: system },
        { role: 'user', content: `Claims:\n${claimBlock}` },
      ],
      { json: true },
    );

    const { score, reasoning } = this.parse(completion.content);
    return { model, score, reasoning, requestId: completion.requestId };
  }

  private parse(content: string): { score: number; reasoning: string } {
    try {
      const parsed = JSON.parse(content) as { score?: number; reasoning?: string };
      const score = Math.min(100, Math.max(0, Number(parsed.score ?? 50)));
      return { score, reasoning: parsed.reasoning ?? 'No reasoning provided.' };
    } catch {
      // Never fabricate — surface the raw content and a neutral score.
      return { score: 50, reasoning: `Unparseable model output: ${content.slice(0, 500)}` };
    }
  }
}
