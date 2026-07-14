import { Injectable } from '@nestjs/common';
import { EvidenceDirection, Verdict } from '../../entities';
import { ClaimScore, ClaimScoreInput, OverallScore } from './consensus.types';

@Injectable()
export class ConsensusService {
  scoreClaim(input: ClaimScoreInput): ClaimScore {
    const modelMean = (input.kimiProbability + input.minimaxProbability) / 2;
    const disagreement = Math.abs(input.kimiProbability - input.minimaxProbability);
    let weightedDirection = 0;
    let totalWeight = 0;
    let qualityTotal = 0;
    for (const evidence of input.evidence) {
      const quality = (evidence.kimiQuality + evidence.minimaxQuality) / 200;
      const weight = quality * this.clamp(evidence.relevance, 0, 1);
      const direction =
        evidence.direction === EvidenceDirection.SUPPORTS
          ? 1
          : evidence.direction === EvidenceDirection.OPPOSES
            ? -1
            : 0;
      weightedDirection += direction * weight;
      totalWeight += Math.abs(weight);
      qualityTotal += quality * 100;
    }
    const rawEvidenceScore = 50 + 50 * (weightedDirection / Math.max(totalWeight, 1));
    const coverage = Math.min(1, new Set(input.evidence.map((item) => item.domain)).size / 3);
    const evidenceScore = 50 + (rawEvidenceScore - 50) * coverage;
    const adversarialPenalty = Math.min(
      20,
      input.challenges
        .filter((challenge) => !challenge.resolved)
        .reduce((sum, challenge) => sum + challenge.severity, 0) / 10,
    );
    const truthScore = this.clamp(
      Math.round(0.6 * evidenceScore + 0.4 * modelMean - adversarialPenalty),
      0,
      100,
    );
    const averageConfidence = (input.kimiConfidence + input.minimaxConfidence) / 2;
    const averageQuality = input.evidence.length ? qualityTotal / input.evidence.length : 0;
    const confidenceScore = this.clamp(
      Math.round(
        0.35 * averageConfidence +
          0.25 * (100 - disagreement) +
          0.25 * coverage * 100 +
          0.15 * averageQuality,
      ),
      0,
      100,
    );
    return {
      truthScore,
      confidenceScore,
      verdict: this.verdict(truthScore),
      evidenceScore,
      modelMean,
      disagreement,
      adversarialPenalty,
    };
  }
  overall(scores: Array<ClaimScore & { importance: number }>): OverallScore {
    if (!scores.length) return { truthScore: 50, confidenceScore: 0, verdict: Verdict.UNVERIFIED };
    const total = scores.reduce((sum, score) => sum + score.importance, 0);
    const truthScore = Math.round(
      scores.reduce((sum, score) => sum + score.truthScore * score.importance, 0) / total,
    );
    const confidenceScore = Math.round(
      scores.reduce((sum, score) => sum + score.confidenceScore * score.importance, 0) / total,
    );
    return { truthScore, confidenceScore, verdict: this.verdict(truthScore) };
  }
  verdict(score: number): Verdict {
    return score >= 70
      ? Verdict.SUPPORTED
      : score >= 50
        ? Verdict.UNVERIFIED
        : score >= 25
          ? Verdict.MISLEADING
          : Verdict.CONTRADICTED;
  }
  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }
}
