import { BadRequestException } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const blockedNames = new Set(['localhost', 'localhost.localdomain', 'metadata.google.internal']);

export function normalizeUrl(raw: string): string {
  let url: URL;

  try {
    url = new URL(raw);
  } catch {
    throw new BadRequestException('Invalid URL');
  }

  if (!['http:', 'https:'].includes(url.protocol))
    throw new BadRequestException('Only HTTP(S) URLs are supported');

  url.username = '';
  url.password = '';
  url.hash = '';

  for (const key of [...url.searchParams.keys()])
    if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) url.searchParams.delete(key);

  url.hostname = url.hostname.toLowerCase();

  return url.toString();
}

export async function assertPublicUrl(raw: string): Promise<string> {
  const normalized = normalizeUrl(raw);
  const url = new URL(normalized);

  if (blockedNames.has(url.hostname) || url.hostname.endsWith('.local'))
    throw new BadRequestException('Private network URLs are not allowed');

  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true });

  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address)))
    throw new BadRequestException('Private network URLs are not allowed');

  return normalized;
}

export function isPrivateIp(ip: string): boolean {
  const value = ip.toLowerCase();

  if (
    value === '::1' ||
    value === '::' ||
    value.startsWith('fc') ||
    value.startsWith('fd') ||
    value.startsWith('fe8') ||
    value.startsWith('fe9') ||
    value.startsWith('fea') ||
    value.startsWith('feb')
  )
    return true;

  const mapped = value.startsWith('::ffff:') ? value.slice(7) : value;
  const parts = mapped.split('.').map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;

  return (
    parts[0] === 10 ||
    parts[0] === 127 ||
    parts[0] === 0 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    parts[0] >= 224
  );
}
