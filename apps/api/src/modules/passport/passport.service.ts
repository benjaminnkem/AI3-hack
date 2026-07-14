import { Injectable } from '@nestjs/common';
import { keccak256, toUtf8Bytes } from 'ethers';
import { HashedPassport, PassportDocument } from './passport.types';

/**
 * Builds the Evidence Passport and produces a deterministic keccak256 hash
 * over its CANONICAL JSON form. Canonicalisation (sorted keys) guarantees
 * that the same passport always yields the same hash, which is what the
 * on-chain attestation anchors and what the public page re-verifies.
 */
@Injectable()
export class PassportService {
  static readonly VERSION = '1.0.0';

  /** Deterministic serialisation: keys sorted recursively. */
  canonicalize(value: unknown): string {
    return JSON.stringify(this.sortKeys(value));
  }

  hashDocument(document: PassportDocument): HashedPassport {
    const canonical = this.canonicalize(document);
    const passportHash = keccak256(toUtf8Bytes(canonical));
    return { document, passportHash };
  }

  /** Recompute the hash of a stored document — used by the public verify page. */
  verifyHash(document: PassportDocument, expectedHash: string): boolean {
    return this.hashDocument(document).passportHash === expectedHash;
  }

  private sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((v) => this.sortKeys(v));
    if (value && typeof value === 'object') {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = this.sortKeys((value as Record<string, unknown>)[key]);
          return acc;
        }, {});
    }
    return value;
  }
}
