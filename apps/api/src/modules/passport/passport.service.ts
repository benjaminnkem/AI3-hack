import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Attestation, AttestationStatus, ModelResponse, Passport } from '../../entities';
import { BlockchainService } from '../blockchain/blockchain.service';
import { IntegrityService } from '../integrity/integrity.service';
@Injectable()
export class PassportService {
  constructor(
    @InjectRepository(Passport) private readonly passports: Repository<Passport>,
    @InjectRepository(Attestation) private readonly attestations: Repository<Attestation>,
    @InjectRepository(ModelResponse) private readonly responses: Repository<ModelResponse>,
    private readonly integrity: IntegrityService,
    private readonly blockchain: BlockchainService,
    private readonly config: ConfigService,
  ) {}
  async get(publicId: string): Promise<Record<string, unknown>> {
    return this.present(await this.find(publicId));
  }
  async list(query: { cursor?: string; limit?: string; verdict?: string; inputType?: string }) {
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 20)));
    const where: Record<string, unknown> = {};
    if (query.cursor) where.createdAt = LessThan(new Date(query.cursor));
    if (query.verdict) where.verdict = query.verdict;
    const rows = await this.passports.find({
      where,
      order: { createdAt: 'DESC' },
      take: limit + 1,
      relations: { verification: true, attestation: true },
    });
    const filtered = query.inputType
      ? rows.filter((row) => row.verification.inputType === query.inputType)
      : rows;
    return {
      items: filtered.slice(0, limit).map((row) => this.present(row)),
      nextCursor: filtered.length > limit ? filtered[limit - 1].createdAt.toISOString() : null,
    };
  }
  async badge(publicId: string) {
    const p = await this.find(publicId);
    return {
      publicId,
      verdict: p.verdict,
      truthScore: p.truthScore,
      generatedAt: p.createdAt.toISOString(),
      url: `/p/${publicId}`,
    };
  }
  async retry(publicId: string) {
    const p = await this.find(publicId);
    if (!this.blockchain.enabled) throw new ConflictException('Attestation is disabled');
    if (p.attestation?.status === AttestationStatus.CONFIRMED) return this.present(p);
    const receipt = await this.blockchain.attest({
      passportHash: p.passportHash,
      inputHash: p.verification.inputHash,
      claimsRoot: p.claimsRoot,
      evidenceRoot: p.evidenceRoot,
      kimiOutputHash: p.kimiOutputHash,
      minimaxOutputHash: p.minimaxOutputHash,
      requestIdsHash: p.requestIdsHash,
      truthScore: p.truthScore,
      verificationVersion: p.version,
    });
    const a =
      p.attestation ??
      this.attestations.create({
        passportId: p.id,
        network: this.config.get('ATTESTATION_NETWORK', 'ethereum-sepolia'),
        chainId: this.config.get('ATTESTATION_CHAIN_ID', 11155111),
      });
    Object.assign(a, {
      status: AttestationStatus.CONFIRMED,
      contractAddress: receipt?.contractAddress ?? this.config.get('MESH_CONTRACT_ADDRESS'),
      transactionHash: receipt?.transactionHash ?? a.transactionHash ?? null,
      blockNumber: receipt?.blockNumber === null ? a.blockNumber : String(receipt?.blockNumber),
      attestor: receipt?.attestor ?? a.attestor,
      errorMessage: null,
      attestedAt: new Date(),
    });
    await this.attestations.save(a);
    return this.present(await this.find(publicId));
  }
  async verifyIntegrity(publicId: string) {
    const p = await this.find(publicId);
    const payload = p.canonicalPayload;
    const claims = (payload.claims ?? []) as Array<Record<string, unknown>>;
    const evidence = (payload.evidence ?? []) as unknown[];
    const responses = await this.responses.find({ where: { verificationId: p.verificationId } });
    const kimi = responses.find((r) => r.agentRole === 'KIMI_INVESTIGATOR')?.parsedOutput ?? {
      claims: [],
    };
    const minimax = responses.find((r) => r.agentRole === 'MINIMAX_INVESTIGATOR')?.parsedOutput ?? {
      claims: [],
    };
    const recomputed = {
      claimsRoot: this.integrity.merkleRoot(
        claims.map((c) => ({
          id: c.id,
          text: c.text,
          importance: c.importance,
          claimHash: c.claimHash,
          truthScore: c.truthScore,
          confidenceScore: c.confidenceScore,
          verdict: c.verdict,
        })),
      ),
      evidenceRoot: this.integrity.merkleRoot(
        evidence.map((item) => {
          const e = item as Record<string, unknown>;
          return {
            id: e.id,
            claimId: e.claimId,
            canonicalUrl: e.url ? this.canonicalUrl(String(e.url)) : '',
            contentHash: e.contentHash,
            direction: e.direction,
            relevanceScore: e.relevanceScore,
            sourceQualityScore: e.sourceQualityScore,
          };
        }),
      ),
      kimiOutputHash: this.integrity.hash(kimi),
      minimaxOutputHash: this.integrity.hash(minimax),
      requestIdsHash: this.integrity.requestIdsHash(responses.map((r) => r.gonkaResponseId)),
      passportHash: this.integrity.hash(payload),
    };
    const stored = {
      claimsRoot: p.claimsRoot,
      evidenceRoot: p.evidenceRoot,
      kimiOutputHash: p.kimiOutputHash,
      minimaxOutputHash: p.minimaxOutputHash,
      requestIdsHash: p.requestIdsHash,
      passportHash: p.passportHash,
    };
    const chain = await this.blockchain.read(p.passportHash);
    const matches = Object.fromEntries(
      Object.keys(stored).map((key) => [
        key,
        recomputed[key as keyof typeof recomputed] === stored[key as keyof typeof stored],
      ]),
    );
    const onChainMatches = chain
      ? {
          inputHash: chain.inputHash === p.verification.inputHash,
          claimsRoot: chain.claimsRoot === p.claimsRoot,
          evidenceRoot: chain.evidenceRoot === p.evidenceRoot,
          kimiOutputHash: chain.kimiOutputHash === p.kimiOutputHash,
          minimaxOutputHash: chain.minimaxOutputHash === p.minimaxOutputHash,
          requestIdsHash: chain.requestIdsHash === p.requestIdsHash,
          truthScore: chain.truthScore === p.truthScore,
          verificationVersion: chain.verificationVersion === p.version,
        }
      : null;
    return {
      recomputed,
      stored,
      onChain: chain,
      matches: { ...matches, onChain: onChainMatches },
      valid:
        Object.values(matches).every(Boolean) &&
        (!this.blockchain.enabled ||
          (!!onChainMatches && Object.values(onChainMatches).every(Boolean))),
    };
  }
  private async find(publicId: string) {
    const p = await this.passports.findOne({
      where: { publicId },
      relations: { verification: true, attestation: true },
    });
    if (!p) throw new NotFoundException('Passport not found');
    return p;
  }
  private present(p: Passport) {
    const attestation = p.attestation
      ? {
          status: p.attestation.status,
          network: p.attestation.network,
          chainId: p.attestation.chainId,
          contractAddress: p.attestation.contractAddress,
          transactionHash: p.attestation.transactionHash,
          blockNumber: p.attestation.blockNumber ? Number(p.attestation.blockNumber) : null,
          attestor: p.attestation.attestor,
          explorerUrl: p.attestation.transactionHash
            ? `${this.config.get('ATTESTATION_EXPLORER_URL')}/tx/${p.attestation.transactionHash}`
            : null,
        }
      : null;
    return {
      ...p.canonicalPayload,
      integrity: { ...(p.canonicalPayload.integrity as object), passportHash: p.passportHash },
      attestation,
    };
  }
  private canonicalUrl(url: string) {
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      for (const key of [...parsed.searchParams.keys()])
        if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) parsed.searchParams.delete(key);
      return parsed.toString();
    } catch {
      return url;
    }
  }
}
