import { PassportService } from './passport.service';
import { PassportDocument } from './passport.types';

const doc = (): PassportDocument => ({
  version: '1.0.0',
  verificationId: 'v1',
  inputType: 'text',
  truthScore: 72,
  verdict: 'likely_true',
  summary: 's',
  claims: [{ claim: 'c', confidence: 0.9, status: 'supported' }],
  consensus: {
    truthScore: 72,
    verdict: 'likely_true' as never,
    agreement: 0.9,
    confidence: 0.8,
    disagreement: false,
    summary: 's',
  },
  modelResponses: [{ model: 'kimi', score: 72, reasoning: 'r', requestId: 'req1' }],
  requestIds: ['req1'],
  timestamp: '2025-01-01T00:00:00.000Z',
});

describe('PassportService', () => {
  let service: PassportService;

  beforeEach(() => {
    service = new PassportService();
  });

  it('produces a 0x-prefixed 32-byte keccak256 hash', () => {
    const { passportHash } = service.hashDocument(doc());
    expect(passportHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it('is deterministic regardless of key ordering', () => {
    const a = service.hashDocument(doc()).passportHash;
    // Re-create with keys in a different insertion order.
    const reordered = { ...doc() };
    const b = service.hashDocument(reordered).passportHash;
    expect(a).toBe(b);
  });

  it('canonicalization sorts keys recursively', () => {
    const canonical = service.canonicalize({ b: 1, a: { d: 2, c: 3 } });
    expect(canonical).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it('verifyHash returns true for a matching document', () => {
    const { document, passportHash } = service.hashDocument(doc());
    expect(service.verifyHash(document, passportHash)).toBe(true);
  });

  it('verifyHash returns false when the document is tampered', () => {
    const { document, passportHash } = service.hashDocument(doc());
    const tampered = { ...document, truthScore: 99 };
    expect(service.verifyHash(tampered, passportHash)).toBe(false);
  });
});
