import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import {
  Attestation,
  Claim,
  ClaimStatus,
  InputType,
  ModelResponse,
  Passport,
  User,
  Verification,
  VerificationStatus,
} from '../../entities';
import { ClaimExtractionService } from '../claim-extraction/claim-extraction.service';
import { ConsensusService } from '../consensus/consensus.service';
import { PassportService } from '../passport/passport.service';
import { PassportDocument } from '../passport/passport.types';
import { BlockchainService } from '../blockchain/blockchain.service';
import { InputResolverService } from './input-resolver.service';
import { VerificationModelService } from './verification-model.service';
import { CreateVerificationDto } from './dto/create-verification.dto';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Passport) private readonly passports: Repository<Passport>,
    @InjectRepository(Attestation) private readonly attestations: Repository<Attestation>,
    private readonly resolver: InputResolverService,
    private readonly claimExtraction: ClaimExtractionService,
    private readonly modelPanel: VerificationModelService,
    private readonly consensus: ConsensusService,
    private readonly passportService: PassportService,
    private readonly blockchain: BlockchainService,
  ) {}

  /** Runs the full verification pipeline and returns the assembled passport. */
  async verify(dto: CreateVerificationDto): Promise<PassportDocument & {
    publicId: string;
    passportHash: string;
    attestation: Attestation | null;
  }> {
    const user = await this.resolveUser(dto.walletAddress);

    const verification = this.verifications.create({
      inputType: dto.inputType,
      originalInput: dto.input,
      status: VerificationStatus.EXTRACTING,
      user,
    });
    await this.verifications.save(verification);

    try {
      // 1. Resolve input → text
      const text = await this.resolver.resolve(dto.inputType, dto.input);

      // 2. Extract claims
      const extracted = await this.claimExtraction.extract(text);
      const claimEntities = extracted.map((c) =>
        this.newClaim(verification.id, c.claim, c.confidence),
      );

      // 3. Multi-model verification panel
      verification.status = VerificationStatus.VERIFYING;
      await this.verifications.save(verification);
      const verdicts = await this.modelPanel.runPanel(extracted.map((c) => c.claim));

      // 4. Consensus
      const consensus = this.consensus.buildConsensus(verdicts);

      // Assign per-claim status from the aggregate verdict (heuristic).
      const claimStatus = this.claimStatusFromScore(consensus.truthScore, consensus.disagreement);
      claimEntities.forEach((c) => (c.status = claimStatus));

      const modelResponses: ModelResponse[] = verdicts.map((v) =>
        Object.assign(new ModelResponse(), {
          verificationId: verification.id,
          model: v.model,
          reasoning: v.reasoning,
          confidence: v.score,
          requestId: v.requestId,
        }),
      );

      verification.truthScore = consensus.truthScore;
      verification.summary = consensus.summary;
      verification.claims = claimEntities;
      verification.modelResponses = modelResponses;

      // 5. Build + hash passport
      const document: PassportDocument = {
        version: PassportService.VERSION,
        verificationId: verification.id,
        inputType: dto.inputType,
        truthScore: consensus.truthScore,
        verdict: consensus.verdict,
        summary: consensus.summary,
        claims: extracted.map((c) => ({
          claim: c.claim,
          confidence: c.confidence,
          status: claimStatus,
        })),
        consensus,
        modelResponses: verdicts.map((v) => ({
          model: v.model,
          score: v.score,
          reasoning: v.reasoning,
          requestId: v.requestId,
        })),
        requestIds: verdicts.map((v) => v.requestId).filter((r): r is string => !!r),
        timestamp: new Date().toISOString(),
      };
      const { passportHash } = this.passportService.hashDocument(document);

      const publicId = this.generatePublicId();
      const passport = this.passports.create({
        verificationId: verification.id,
        passportHash,
        publicId,
      });

      // 6. On-chain attestation (skipped gracefully if unconfigured)
      verification.status = VerificationStatus.ATTESTING;
      await this.verifications.save(verification);
      const receipt = await this.blockchain.attest(
        passportHash,
        consensus.truthScore,
        this.versionToInt(PassportService.VERSION),
        document.requestIds[0] ?? 'n/a',
      );

      await this.passports.save(passport);

      let attestation: Attestation | null = null;
      if (receipt) {
        attestation = this.attestations.create({
          passportId: passport.id,
          transactionHash: receipt.transactionHash,
          blockNumber: String(receipt.blockNumber),
          chainId: receipt.chainId,
        });
        await this.attestations.save(attestation);
      }

      verification.status = VerificationStatus.COMPLETED;
      await this.verifications.save(verification);

      return { ...document, publicId, passportHash, attestation };
    } catch (err) {
      verification.status = VerificationStatus.FAILED;
      await this.verifications.save(verification);
      this.logger.error(`Verification ${verification.id} failed`, err as Error);
      throw err;
    }
  }

  async findByPublicId(publicId: string): Promise<Passport> {
    const passport = await this.passports.findOne({
      where: { publicId },
      relations: { attestations: true, verification: { claims: true, modelResponses: true } },
    });
    if (!passport) throw new NotFoundException(`Passport ${publicId} not found.`);
    return passport;
  }

  async listVerifications(limit = 50): Promise<Verification[]> {
    return this.verifications.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: { passport: true },
    });
  }

  // ---- helpers ----
  private async resolveUser(walletAddress?: string): Promise<User | null> {
    if (!walletAddress) return null;
    let user = await this.users.findOne({ where: { walletAddress } });
    if (!user) {
      user = this.users.create({ walletAddress });
      await this.users.save(user);
    }
    return user;
  }

  private newClaim(verificationId: string, claim: string, confidence: number): Claim {
    return Object.assign(new Claim(), {
      verificationId,
      claim,
      confidence,
      status: ClaimStatus.UNVERIFIABLE,
    });
  }

  private claimStatusFromScore(score: number, disagreement: boolean): ClaimStatus {
    if (disagreement) return ClaimStatus.MIXED;
    if (score >= 65) return ClaimStatus.SUPPORTED;
    if (score <= 35) return ClaimStatus.CONTRADICTED;
    return ClaimStatus.MIXED;
  }

  private generatePublicId(): string {
    return randomBytes(8).toString('hex');
  }

  private versionToInt(version: string): number {
    // "1.0.0" → 100 ; keeps a compact uint for the contract.
    const [major, minor, patch] = version.split('.').map(Number);
    return major * 100 + minor * 10 + patch;
  }
}
