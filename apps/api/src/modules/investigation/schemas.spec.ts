import { EvidenceDirection, Verdict } from '../../entities';
import {
  adversarialSchema,
  claimExtractionSchema,
  investigatorSchema,
  narrativeSchema,
} from './schemas';
import { alignInvestigatorOutput } from './align';

describe('investigation schemas', () => {
  it('clamps claim importance above 5', () => {
    const parsed = claimExtractionSchema.parse({
      claims: [
        {
          text: 'The AI Act was passed in 2024.',
          normalizedText: 'The AI Act was passed in 2024.',
          importance: 10,
          context: '',
          dateSensitive: false,
          searchQueries: ['AI Act 2024'],
        },
      ],
    });
    expect(parsed.claims[0].importance).toBe(5);
  });

  it('defaults missing claims array to empty', () => {
    const parsed = claimExtractionSchema.parse({});
    expect(parsed.claims).toEqual([]);
  });

  it('normalizes lowercase directions and alternate field names', () => {
    const parsed = investigatorSchema.parse({
      claims: [
        {
          claimId: 'not-a-uuid',
          supportProbability: 0.8,
          confidenceScore: 70,
          verdict: 'true',
          reasoning: 'Looks supported',
          evidence: [
            {
              id: 'ev-1',
              direction: 'supports',
              quality: 90,
            },
          ],
        },
      ],
    });

    expect(parsed.claims[0].supportProbability).toBe(80);
    expect(parsed.claims[0].confidence).toBe(70);
    expect(parsed.claims[0].verdictSuggestion).toBe(Verdict.SUPPORTED);
    expect(parsed.claims[0].evidenceAssessments[0]).toEqual({
      evidenceId: 'ev-1',
      direction: EvidenceDirection.SUPPORTS,
      qualityScore: 90,
    });
  });

  it('accepts adversarial challenges with loose shape', () => {
    const parsed = adversarialSchema.parse({
      challenges: [
        {
          claim_id: 'c1',
          issue: 'Source is weak',
          severity: 80,
          resolved: false,
        },
      ],
    });
    expect(parsed.challenges[0].challenge).toBe('Source is weak');
    expect(parsed.challenges[0].claimId).toBe('c1');
  });

  it('accepts narrative with alternate keys', () => {
    const parsed = narrativeSchema.parse({
      overview: 'Overall summary',
      claims: [{ id: 'c1', summary: 'Claim notes' }],
    });
    expect(parsed.summary).toBe('Overall summary');
    expect(parsed.claimReasoning[0].reasoningSummary).toBe('Claim notes');
  });

  it('realigns investigator claim and evidence ids to known records', () => {
    const claims = [
      { id: '11111111-1111-1111-1111-111111111111', text: 'A' },
      { id: '22222222-2222-2222-2222-222222222222', text: 'B' },
    ] as any;
    const evidence = [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        claimId: '11111111-1111-1111-1111-111111111111',
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        claimId: '22222222-2222-2222-2222-222222222222',
      },
    ] as any;

    const aligned = alignInvestigatorOutput(
      {
        claims: [
          {
            claimId: 'wrong-1',
            supportProbability: 70,
            confidence: 60,
            verdictSuggestion: Verdict.SUPPORTED,
            reasoningSummary: 'one',
            evidenceAssessments: [
              {
                evidenceId: 'wrong-ev',
                direction: EvidenceDirection.SUPPORTS,
                qualityScore: 80,
              },
            ],
            missingContext: [],
            uncertainty: '',
          },
        ],
      },
      claims,
      evidence,
    );

    expect(aligned.claims).toHaveLength(2);
    expect(aligned.claims[0].claimId).toBe(claims[0].id);
    expect(aligned.claims[0].evidenceAssessments[0].evidenceId).toBe(evidence[0].id);
    expect(aligned.claims[1].claimId).toBe(claims[1].id);
    expect(aligned.claims[1].supportProbability).toBe(50);
  });
});
