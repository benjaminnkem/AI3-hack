import { EvidenceDirection, Verdict } from '../../entities';
import { ConsensusService } from './consensus.service';
describe('ConsensusService', () => {
  const service = new ConsensusService();
  const base = {
    importance: 1,
    kimiProbability: 80,
    minimaxProbability: 80,
    kimiConfidence: 80,
    minimaxConfidence: 80,
    challenges: [],
  };
  it.each([
    [0, Verdict.CONTRADICTED],
    [24, Verdict.CONTRADICTED],
    [25, Verdict.MISLEADING],
    [49, Verdict.MISLEADING],
    [50, Verdict.UNVERIFIED],
    [69, Verdict.UNVERIFIED],
    [70, Verdict.SUPPORTED],
    [100, Verdict.SUPPORTED],
  ])('maps %s', (score, verdict) => expect(service.verdict(score as number)).toBe(verdict));
  it('implements evidence coverage and formula', () => {
    const evidence = ['a.com', 'b.com', 'c.com'].map((domain) => ({
      domain,
      relevance: 1,
      direction: EvidenceDirection.SUPPORTS,
      kimiQuality: 100,
      minimaxQuality: 100,
    }));
    const score = service.scoreClaim({ ...base, evidence });
    expect(score.evidenceScore).toBe(100);
    expect(score.truthScore).toBe(92);
    expect(score.confidenceScore).toBe(93);
  });
  it('caps unresolved adversarial penalty at 20', () =>
    expect(
      service.scoreClaim({
        ...base,
        evidence: [],
        challenges: [
          { severity: 100, resolved: false },
          { severity: 100, resolved: false },
          { severity: 100, resolved: false },
        ],
      }).adversarialPenalty,
    ).toBe(20));
  it('weights overall scores by importance', () =>
    expect(
      service.overall([
        { ...service.scoreClaim({ ...base, evidence: [], challenges: [] }), importance: 1 },
        {
          ...service.scoreClaim({
            ...base,
            kimiProbability: 20,
            minimaxProbability: 20,
            evidence: [],
            challenges: [],
          }),
          importance: 3,
        },
      ]).truthScore,
    ).toBe(44));
});
