import { Injectable } from '@nestjs/common';
import { ConsensusResult, ModelVerdict, Verdict } from './consensus.types';

/**
 * ConsensusService turns N independent model verdicts into a single,
 * explainable truth score. All values are DERIVED from the inputs —
 * nothing here is hardcoded.
 *
 * Method:
 *  1. Aggregate score = mean of model scores, weighted toward the median
 *     to blunt a single outlier model.
 *  2. Agreement = 1 - normalised standard deviation of the scores.
 *  3. Confidence = agreement scaled by how decisive the mean is
 *     (scores near 50 are inherently less confident than scores near 0/100).
 *  4. Disagreement flag trips when std-dev exceeds DISPERSION_THRESHOLD.
 */
@Injectable()
export class ConsensusService {
  /** Std-dev (in score points) above which we flag model disagreement. */
  private static readonly DISPERSION_THRESHOLD = 20;

  buildConsensus(verdicts: ModelVerdict[]): ConsensusResult {
    if (verdicts.length === 0) {
      throw new Error('ConsensusService requires at least one model verdict.');
    }

    const scores = verdicts.map((v) => this.clamp(v.score, 0, 100));

    const mean = this.mean(scores);
    const median = this.median(scores);
    // Blend mean and median (70/30) — robust to a single rogue model.
    const truthScore = this.round(0.7 * mean + 0.3 * median);

    const stdDev = this.stdDev(scores, mean);
    // Normalise std-dev against the theoretical max spread (50 for a 0-100 range).
    const agreement = this.round1(1 - Math.min(stdDev / 50, 1));

    // Decisiveness: distance of the mean from the ambiguous midpoint (50).
    const decisiveness = Math.abs(mean - 50) / 50; // 0 at 50, 1 at extremes
    const confidence = this.round1(this.clamp(agreement * (0.5 + 0.5 * decisiveness), 0, 1));

    const disagreement = stdDev > ConsensusService.DISPERSION_THRESHOLD;

    return {
      truthScore,
      verdict: this.toVerdict(truthScore, disagreement),
      agreement,
      confidence,
      disagreement,
      summary: this.buildSummary(truthScore, verdicts, disagreement, agreement),
    };
  }

  private toVerdict(score: number, disagreement: boolean): Verdict {
    if (disagreement && score > 35 && score < 65) return Verdict.MIXED;
    if (score >= 85) return Verdict.TRUE;
    if (score >= 65) return Verdict.LIKELY_TRUE;
    if (score >= 45) return Verdict.MIXED;
    if (score >= 25) return Verdict.LIKELY_FALSE;
    if (score >= 5) return Verdict.FALSE;
    return Verdict.UNVERIFIABLE;
  }

  private buildSummary(
    score: number,
    verdicts: ModelVerdict[],
    disagreement: boolean,
    agreement: number,
  ): string {
    const models = verdicts.map((v) => v.model).join(', ');
    const agreePct = Math.round(agreement * 100);
    const base = `Across ${verdicts.length} model(s) (${models}), Mesh derived a truth score of ${score}/100 with ${agreePct}% inter-model agreement.`;
    return disagreement
      ? `${base} Models diverged significantly on this claim set — treat the verdict as contested and review each model's reasoning below.`
      : `${base} Models were broadly aligned on this assessment.`;
  }

  // ---- pure numeric helpers ----
  private mean(xs: number[]): number {
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }

  private median(xs: number[]): number {
    const s = [...xs].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 !== 0 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  private stdDev(xs: number[], mean: number): number {
    if (xs.length < 2) return 0;
    const variance = xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / xs.length;
    return Math.sqrt(variance);
  }

  private clamp(x: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, x));
  }

  private round(x: number): number {
    return Math.round(x);
  }

  private round1(x: number): number {
    return Math.round(x * 100) / 100;
  }
}
