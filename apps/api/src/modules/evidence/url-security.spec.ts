import { isPrivateIp, normalizeUrl } from './url-security';
describe('URL security', () => {
  it('normalizes tracking and fragments', () =>
    expect(normalizeUrl('HTTPS://Example.COM/a?utm_source=x&ok=1#x')).toBe(
      'https://example.com/a?ok=1',
    ));
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '172.16.0.1',
    '192.168.1.1',
    '169.254.169.254',
    '::1',
    'fc00::1',
  ])('blocks %s', (ip) => expect(isPrivateIp(ip)).toBe(true));
  it('allows public IPs', () => expect(isPrivateIp('8.8.8.8')).toBe(false));
  it('rejects unsupported schemes', () =>
    expect(() => normalizeUrl('file:///etc/passwd')).toThrow());
});
