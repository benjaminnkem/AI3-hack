import { ConsensusService } from './consensus.service';
import { ModelVerdict, Verdict } from './consensus.types';

const verdict = (model: string, score: number): ModelVerdict => ({
  model,
  score,
  reasoning: 'r',
  requestId: `req_${model}`,
});

describe('ConsensusService', () => {
  let service: ConsensusService;

  beforeEach(() => {
    service = new ConsensusService();
  });

  it('throws with no verdicts', () => {
    expect(() => service.buildConsensus([])).toThrow();
  });

  it('produces a high truth score when models agree the claim is true', () => {
    const result = service.buildConsensus([verdict('kimi', 92), verdict('minimax', 88)]);
    expect(result.truthScore).toBeGreaterThanOrEqual(85);
    expect(result.verdict).toBe(Verdict.TRUE);
    expect(result.disagreement).toBe(false);
    expect(result.agreement).toBeGreaterThan(0.9);
  });

  it('produces a low truth score when models agree the claim is false', () => {
    const result = service.buildConsensus([verdict('kimi', 8), verdict('minimax', 12)]);
    expect(result.truthScore).toBeLessThanOrEqual(15);
    expect(result.verdict).toBe(Verdict.FALSE);
  });

  it('flags disagreement when model scores diverge widely', () => {
    const result = service.buildConsensus([verdict('kimi', 90), verdict('minimax', 20)]);
    expect(result.disagreement).toBe(true);
    expect(result.agreement).toBeLessThan(0.5);
    expect(result.summary.toLowerCase()).toContain('diverged');
  });

  it('lowers confidence for ambiguous mid-range scores even when models agree', () => {
    const agreedExtreme = service.buildConsensus([verdict('a', 95), verdict('b', 95)]);
    const agreedMiddle = service.buildConsensus([verdict('a', 50), verdict('b', 50)]);
    expect(agreedMiddle.confidence).toBeLessThan(agreedExtreme.confidence);
  });

  it('is robust to a single outlier via median blending', () => {
    const result = service.buildConsensus([
      verdict('a', 80),
      verdict('b', 82),
      verdict('c', 5),
    ]);
    // Median (80) pulls the blended score above a plain mean (~55.6).
    expect(result.truthScore).toBeGreaterThan(55);
  });

  it('clamps out-of-range scores', () => {
    const result = service.buildConsensus([verdict('a', 150), verdict('b', -30)]);
    expect(result.truthScore).toBeGreaterThanOrEqual(0);
    expect(result.truthScore).toBeLessThanOrEqual(100);
  });
});
