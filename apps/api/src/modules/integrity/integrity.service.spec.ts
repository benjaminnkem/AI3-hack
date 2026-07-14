import { keccak256 } from 'ethers';
import { IntegrityService } from './integrity.service';
describe('IntegrityService', () => {
  const service = new IntegrityService();
  it('sorts object keys recursively and preserves arrays', () =>
    expect(service.canonicalize({ b: 1, a: [{ d: 2, c: 3 }] })).toBe(
      '{"a":[{"c":3,"d":2}],"b":1}',
    ));
  it('creates deterministic hashes and roots', () =>
    expect(service.merkleRoot([{ b: 2 }, { a: 1 }])).toBe(
      service.merkleRoot([{ a: 1 }, { b: 2 }]),
    ));
  it('defines the empty root', () =>
    expect(service.merkleRoot([])).toBe(keccak256(new Uint8Array())));
  it('sorts request ids', () =>
    expect(service.requestIdsHash(['b', 'a'])).toBe(service.requestIdsHash(['a', 'b'])));
});
