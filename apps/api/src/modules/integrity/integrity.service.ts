import { Injectable } from '@nestjs/common';
import { concat, getBytes, keccak256, toUtf8Bytes } from 'ethers';

@Injectable()
export class IntegrityService {
  canonicalize(value: unknown): string {
    return JSON.stringify(this.sort(value));
  }

  hash(value: unknown): string {
    return keccak256(toUtf8Bytes(this.canonicalize(value)));
  }

  merkleRoot(leaves: unknown[]): string {
    if (leaves.length === 0) return keccak256(new Uint8Array());

    let level = leaves.map((leaf) => this.hash(leaf)).sort();

    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] ?? left;
        next.push(keccak256(concat([getBytes(left), getBytes(right)])));
      }
      level = next.sort();
    }

    return level[0];
  }

  requestIdsHash(ids: string[]): string {
    return this.hash([...ids].sort());
  }

  private sort(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.sort(item));

    if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((result, key) => {
          const item = (value as Record<string, unknown>)[key];
          if (item !== undefined) result[key] = this.sort(item);
          return result;
        }, {});
    }
    return value;
  }
}
