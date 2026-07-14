import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';
import {
  Attestation,
  AttestationStatus,
  Claim,
  Evidence,
  EvidenceDirection,
  InputType,
  ModelResponse,
  Passport,
  Verdict,
  Verification,
  VerificationStatus,
} from '../../entities';
import { BlockchainService, IntegrityValues } from '../blockchain/blockchain.service';
import { ClaimExtractionService } from '../claim-extraction/claim-extraction.service';
import { ConsensusService } from '../consensus/consensus.service';
import { TavilyResult, TavilyService } from '../evidence/tavily.service';
import { normalizeUrl } from '../evidence/url-security';
import { GonkaResult } from '../gonka/gonka.types';
import { IngestionService } from '../ingestion/ingestion.service';
import { IntegrityService } from '../integrity/integrity.service';
import { InvestigationService } from '../investigation/investigation.service';
import { InvestigatorOutput } from '../investigation/schemas';
import { CreateVerificationDto } from './dto/create-verification.dto';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  constructor(
    @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    @InjectRepository(Claim) private readonly claims: Repository<Claim>,
    @InjectRepository(Evidence) private readonly evidence: Repository<Evidence>,
    @InjectRepository(ModelResponse) private readonly responses: Repository<ModelResponse>,
    @InjectRepository(Passport) private readonly passports: Repository<Passport>,
    @InjectRepository(Attestation) private readonly attestations: Repository<Attestation>,
    private readonly ingestion: IngestionService,
    private readonly claimExtraction: ClaimExtractionService,
    private readonly tavily: TavilyService,
    private readonly investigation: InvestigationService,
    private readonly consensus: ConsensusService,
    private readonly integrity: IntegrityService,
    private readonly blockchain: BlockchainService,
    private readonly config: ConfigService,
  ) {}

  async verify(
    dto: CreateVerificationDto,
    file?: Express.Multer.File,
  ): Promise<Record<string, unknown>> {
    this.validateInput(dto, file);
    const inputHash = this.preflightHash(dto, file);
    const previous = await this.latest(inputHash);
    if (previous && !dto.forceRefresh && this.reusable(previous))
      return this.publicPassport(previous);
    const verification = await this.verifications.save(
      this.verifications.create({
        inputType: dto.inputType,
        originalText: dto.content ?? dto.url ?? null,
        sourceUrl: dto.inputType === InputType.URL ? normalizeUrl(dto.url!) : null,
        imageUrl: null,
        normalizedContent: '',
        inputHash,
        status: VerificationStatus.PROCESSING,
        currentStage: 'INGESTION',
        errorCode: null,
        errorMessage: null,
        completedAt: null,
      }),
    );
    try {
      const ingested = await this.ingestion.ingest(dto.inputType, dto.content, dto.url, file);
      Object.assign(verification, {
        originalText: ingested.originalText,
        sourceUrl: ingested.sourceUrl,
        imageUrl: ingested.imageUrl,
        normalizedContent: ingested.normalizedContent,
      });
      await this.verifications.save(verification);
      await this.saveAudits(verification.id, 'VISUAL_NORMALIZATION', ingested.audits, {});
      await this.stage(verification, 'CLAIM_EXTRACTION');
      const extraction = await this.claimExtraction.extract(ingested.normalizedContent);
      await this.saveAudit(
        verification.id,
        'CLAIM_EXTRACTION',
        extraction.audit,
        extraction.output,
      );
      const claimEntities = await this.claims.save(
        extraction.output.claims.map((item) =>
          this.claims.create({
            verificationId: verification.id,
            ...item,
            claimHash: this.integrity.hash({ text: item.normalizedText }),
            truthScore: 50,
            confidenceScore: 0,
            verdict: Verdict.UNVERIFIED,
            reasoningSummary: '',
          }),
        ),
      );
      if (!claimEntities.length)
        return await this.completeNoClaims(
          verification,
          ingested.displayText,
          extraction.audit,
          previous,
        );
      await this.stage(verification, 'EVIDENCE_RETRIEVAL');
      const evidenceEntities = await this.retrieveEvidence(claimEntities);
      await this.stage(verification, 'INVESTIGATION');
      const panel = await this.investigation.investigate(
        ingested.normalizedContent,
        claimEntities,
        evidenceEntities,
        ingested.imageBlock,
      );
      await this.saveAudit(verification.id, 'KIMI_INVESTIGATOR', panel.audits[0], panel.kimi);
      await this.saveAudit(verification.id, 'MINIMAX_INVESTIGATOR', panel.audits[1], panel.minimax);
      await this.stage(verification, 'ADVERSARIAL_REVIEW');
      const adversarial = await this.investigation.adversarial(
        ingested.normalizedContent,
        claimEntities,
        evidenceEntities,
        panel.kimi,
        panel.minimax,
      );
      await this.saveAudit(
        verification.id,
        'ADVERSARIAL_REVIEW',
        adversarial.audit,
        adversarial.output,
      );
      const scored = this.applyScores(
        claimEntities,
        evidenceEntities,
        panel.kimi,
        panel.minimax,
        adversarial.output.challenges,
      );
      const overall = this.consensus.overall(
        scored.map(({ claim, score }) => ({ ...score, importance: claim.importance })),
      );
      await this.stage(verification, 'FINAL_NARRATIVE');
      const narrative = await this.investigation.narrative({
        immutableResult: overall,
        claims: scored.map(({ claim, score }) => ({ id: claim.id, text: claim.text, ...score })),
        challenges: adversarial.output.challenges,
      });
      await this.saveAudit(verification.id, 'FINAL_NARRATIVE', narrative.audit, narrative.output);
      for (const { claim, score } of scored) {
        claim.truthScore = score.truthScore;
        claim.confidenceScore = score.confidenceScore;
        claim.verdict = score.verdict;
        claim.reasoningSummary =
          narrative.output.claimReasoning.find((item) => item.claimId === claim.id)
            ?.reasoningSummary ?? '';
      }
      await this.claims.save(claimEntities);
      await this.evidence.save(evidenceEntities);
      return await this.createPassport({
        verification,
        displayText: ingested.displayText,
        claims: claimEntities,
        evidence: evidenceEntities,
        overall,
        summary: narrative.output.summary,
        kimi: panel.kimi,
        minimax: panel.minimax,
        challenges: adversarial.output.challenges,
        audits: [
          ...ingested.audits,
          extraction.audit,
          ...panel.audits,
          adversarial.audit,
          narrative.audit,
        ],
        previous,
      });
    } catch (error) {
      verification.status = VerificationStatus.FAILED;
      verification.errorCode =
        error instanceof BadRequestException ? 'INVALID_INPUT' : 'PIPELINE_FAILED';
      verification.errorMessage = error instanceof Error ? error.message : 'Unknown failure';
      await this.verifications.save(verification);
      this.logger.error(
        `verification=${verification.id} stage=${verification.currentStage}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getVerification(id: string): Promise<Record<string, unknown>> {
    const verification = await this.verifications.findOne({
      where: { id },
      relations: { passport: { attestation: true } },
    });
    if (!verification) throw new NotFoundException('Verification not found');
    return {
      id: verification.id,
      status: verification.status,
      currentStage: verification.currentStage,
      errorCode: verification.errorCode,
      errorMessage: verification.errorMessage,
      passport: verification.passport ? await this.publicPassport(verification.passport) : null,
    };
  }
  private async retrieveEvidence(claims: Claim[]): Promise<Evidence[]> {
    const output: Evidence[] = [];
    for (const claim of claims) {
      const seen = new Set<string>();
      const queries = [
        ...claim.searchQueries,
        `${claim.text} false OR misleading fact check`,
      ].slice(0, 4);
      for (const query of queries) {
        for (const item of await this.tavily.search(query, claim.dateSensitive)) {
          if (
            seen.has(item.canonicalUrl) ||
            output.filter((e) => e.claimId === claim.id).some((e) => e.domain === item.domain)
          )
            continue;
          seen.add(item.canonicalUrl);
          output.push(
            this.evidence.create({
              claimId: claim.id,
              ...this.toEvidence(item),
              direction: EvidenceDirection.NEUTRAL,
              sourceQualityScore: 0,
            }),
          );
          if (
            output.filter((e) => e.claimId === claim.id).length >=
            this.config.get('TAVILY_MAX_RESULTS_PER_CLAIM', 5)
          )
            break;
        }
        if (
          output.filter((e) => e.claimId === claim.id).length >=
          this.config.get('TAVILY_MAX_RESULTS_PER_CLAIM', 5)
        )
          break;
      }
    }
    return this.evidence.save(output);
  }
  private toEvidence(item: TavilyResult) {
    return {
      title: item.title,
      url: item.url,
      canonicalUrl: item.canonicalUrl,
      domain: item.domain,
      excerpt: item.excerpt,
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
      retrievedAt: new Date(),
      tavilyRelevanceScore: item.relevance,
      contentHash: this.integrity.hash({
        title: item.title,
        url: item.canonicalUrl,
        excerpt: item.excerpt,
        publishedAt: item.publishedAt,
      }),
    };
  }
  private applyScores(
    claims: Claim[],
    evidence: Evidence[],
    kimi: InvestigatorOutput,
    minimax: InvestigatorOutput,
    challenges: Array<{ claimId: string; severity: number; resolved: boolean }>,
  ) {
    return claims.map((claim) => {
      const k = kimi.claims.find((item) => item.claimId === claim.id);
      const m = minimax.claims.find((item) => item.claimId === claim.id);
      if (!k || !m) throw new Error(`Investigator omitted claim ${claim.id}`);
      const claimEvidence = evidence.filter((item) => item.claimId === claim.id);
      const scoredEvidence = claimEvidence.map((item) => {
        const ka = k.evidenceAssessments.find((a) => a.evidenceId === item.id);
        const ma = m.evidenceAssessments.find((a) => a.evidenceId === item.id);
        item.direction =
          ka && ma && ka.direction === ma.direction ? ka.direction : EvidenceDirection.NEUTRAL;
        item.sourceQualityScore = Math.round(
          ((ka?.qualityScore ?? 0) + (ma?.qualityScore ?? 0)) / 2,
        );
        return {
          domain: item.domain,
          relevance: item.tavilyRelevanceScore,
          direction: item.direction,
          kimiQuality: ka?.qualityScore ?? 0,
          minimaxQuality: ma?.qualityScore ?? 0,
        };
      });
      const score = this.consensus.scoreClaim({
        importance: claim.importance,
        kimiProbability: k.supportProbability,
        minimaxProbability: m.supportProbability,
        kimiConfidence: k.confidence,
        minimaxConfidence: m.confidence,
        evidence: scoredEvidence,
        challenges: challenges.filter((item) => item.claimId === claim.id),
      });
      return { claim, score };
    });
  }
  private async createPassport(args: {
    verification: Verification;
    displayText: string;
    claims: Claim[];
    evidence: Evidence[];
    overall: { truthScore: number; confidenceScore: number; verdict: Verdict };
    summary: string;
    kimi: InvestigatorOutput;
    minimax: InvestigatorOutput;
    challenges: unknown[];
    audits: GonkaResult[];
    previous: Passport | null;
  }) {
    const integrity = {
      claimsRoot: this.integrity.merkleRoot(
        args.claims.map((c) => ({
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
        args.evidence.map((e) => ({
          id: e.id,
          claimId: e.claimId,
          canonicalUrl: e.canonicalUrl,
          contentHash: e.contentHash,
          direction: e.direction,
          relevanceScore: e.tavilyRelevanceScore,
          sourceQualityScore: e.sourceQualityScore,
        })),
      ),
      kimiOutputHash: this.integrity.hash(args.kimi),
      minimaxOutputHash: this.integrity.hash(args.minimax),
      requestIdsHash: this.integrity.requestIdsHash(
        this.flattenAudits(args.audits).map((a) => a.responseId),
      ),
    };
    const version = (args.previous?.version ?? 0) + 1;
    const payload = {
      schemaVersion: '1.0.0',
      publicId: this.publicId(),
      verificationId: args.verification.id,
      version,
      generatedAt: new Date().toISOString(),
      input: {
        type: args.verification.inputType,
        displayText: args.displayText,
        sourceUrl: args.verification.sourceUrl,
        imageUrl: args.verification.imageUrl,
        inputHash: args.verification.inputHash,
      },
      verdict: args.overall.verdict,
      truthScore: args.overall.truthScore,
      confidenceScore: args.overall.confidenceScore,
      summary: args.summary,
      claims: args.claims.map((c) => ({
        id: c.id,
        text: c.text,
        importance: c.importance,
        truthScore: c.truthScore,
        confidenceScore: c.confidenceScore,
        verdict: c.verdict,
        reasoningSummary: c.reasoningSummary,
        claimHash: c.claimHash,
      })),
      evidence: args.evidence.map((e) => ({
        id: e.id,
        claimId: e.claimId,
        title: e.title,
        url: e.url,
        domain: e.domain,
        excerpt: e.excerpt,
        publishedAt: e.publishedAt?.toISOString() ?? null,
        retrievedAt: e.retrievedAt.toISOString(),
        direction: e.direction,
        relevanceScore: e.tavilyRelevanceScore,
        sourceQualityScore: e.sourceQualityScore,
        contentHash: e.contentHash,
      })),
      modelConsensus: this.modelConsensus(args.kimi, args.minimax, args.challenges, args.audits),
      integrity,
    };
    const passportHash = this.integrity.hash(payload);
    const passport = await this.passports.save(
      this.passports.create({
        publicId: payload.publicId,
        verificationId: args.verification.id,
        version,
        previousPassportId: args.previous?.id ?? null,
        schemaVersion: '1.0.0',
        verdict: args.overall.verdict,
        truthScore: args.overall.truthScore,
        confidenceScore: args.overall.confidenceScore,
        summary: args.summary,
        disagreementSummary: [],
        canonicalPayload: payload,
        ...integrity,
        passportHash,
      }),
    );
    await this.attest(passport, {
      passportHash,
      inputHash: args.verification.inputHash,
      ...integrity,
      truthScore: args.overall.truthScore,
      verificationVersion: version,
    });
    args.verification.status = VerificationStatus.COMPLETED;
    args.verification.currentStage = 'COMPLETED';
    args.verification.completedAt = new Date();
    await this.verifications.save(args.verification);
    return this.publicPassport(await this.reloadPassport(passport.id));
  }
  private modelConsensus(
    kimi: InvestigatorOutput,
    minimax: InvestigatorOutput,
    challenges: unknown[],
    audits: GonkaResult[],
  ) {
    const k = kimi.claims.length
      ? kimi.claims.reduce((s, c) => s + c.supportProbability, 0) / kimi.claims.length
      : 50;
    const m = minimax.claims.length
      ? minimax.claims.reduce((s, c) => s + c.supportProbability, 0) / minimax.claims.length
      : 50;
    const audit = (model: string) => audits.find((a) => a.modelId === model);
    return {
      agreementScore: Math.round(100 - Math.abs(k - m)),
      disagreements: kimi.claims
        .map((claim) => {
          const other = minimax.claims.find((item) => item.claimId === claim.claimId);
          return other && Math.abs(claim.supportProbability - other.supportProbability) >= 20
            ? `Models differ by ${Math.abs(claim.supportProbability - other.supportProbability)} points on claim ${claim.claimId}`
            : null;
        })
        .filter((value): value is string => value !== null),
      kimi: {
        modelId: 'moonshotai/Kimi-K2.6',
        score: Math.round(k),
        confidence: kimi.claims.length
          ? Math.round(kimi.claims.reduce((s, c) => s + c.confidence, 0) / kimi.claims.length)
          : 0,
        verdict: this.consensus.verdict(Math.round(k)),
        reasoningSummary: kimi.claims.map((c) => c.reasoningSummary).join(' '),
        gonkaResponseId: audit('moonshotai/Kimi-K2.6')?.responseId ?? null,
      },
      minimax: {
        modelId: 'MiniMaxAI/MiniMax-M2.7',
        score: Math.round(m),
        confidence: minimax.claims.length
          ? Math.round(minimax.claims.reduce((s, c) => s + c.confidence, 0) / minimax.claims.length)
          : 0,
        verdict: this.consensus.verdict(Math.round(m)),
        reasoningSummary: minimax.claims.map((c) => c.reasoningSummary).join(' '),
        gonkaResponseId: audit('MiniMaxAI/MiniMax-M2.7')?.responseId ?? null,
      },
      adversarialChallenges: challenges,
    };
  }
  private async completeNoClaims(
    verification: Verification,
    displayText: string,
    audit: GonkaResult,
    previous: Passport | null,
  ) {
    const empty: InvestigatorOutput = { claims: [] };
    return this.createPassport({
      verification,
      displayText,
      claims: [],
      evidence: [],
      overall: { truthScore: 50, confidenceScore: 0, verdict: Verdict.UNVERIFIED },
      summary: 'No independently verifiable factual claim was found in the submitted material.',
      kimi: empty,
      minimax: empty,
      challenges: [],
      audits: [audit],
      previous,
    });
  }
  private async attest(passport: Passport, values: IntegrityValues) {
    const attestation = await this.attestations.save(
      this.attestations.create({
        passportId: passport.id,
        status: this.blockchain.enabled ? AttestationStatus.PENDING : AttestationStatus.DISABLED,
        network: this.config.get('ATTESTATION_NETWORK', 'ethereum-sepolia'),
        chainId: this.config.get('ATTESTATION_CHAIN_ID', 11155111),
        contractAddress: this.config.get('MESH_CONTRACT_ADDRESS') ?? null,
        transactionHash: null,
        blockNumber: null,
        attestor: null,
        errorMessage: null,
        attestedAt: null,
      }),
    );
    if (!this.blockchain.enabled) return;
    try {
      const receipt = await this.blockchain.attest(values);
      Object.assign(attestation, {
        status: AttestationStatus.CONFIRMED,
        transactionHash: receipt?.transactionHash ?? null,
        blockNumber: receipt?.blockNumber === null ? null : String(receipt?.blockNumber),
        attestor: receipt?.attestor ?? null,
        attestedAt: new Date(),
      });
    } catch (error) {
      attestation.status = AttestationStatus.FAILED;
      attestation.errorMessage = error instanceof Error ? error.message : 'Attestation failed';
    }
    await this.attestations.save(attestation);
  }
  private async saveAudit(
    verificationId: string,
    role: string,
    audit: GonkaResult,
    output: unknown,
  ) {
    for (const prior of audit.relatedAudits ?? []) {
      await this.saveAudit(verificationId, `${role}_REPAIR_SOURCE`, prior, {
        invalidStructuredOutput: true,
      });
    }
    await this.responses.save(
      this.responses.create({
        verificationId,
        claimId: null,
        agentRole: role,
        modelId: audit.modelId,
        gonkaResponseId: audit.responseId,
        providerRequestId: audit.providerRequestId,
        parsedOutput: output,
        rawOutput: null,
        outputHash: this.integrity.hash(output),
        inputTokens: audit.inputTokens,
        outputTokens: audit.outputTokens,
        latencyMs: audit.latencyMs,
        retryCount: audit.retryCount,
      }),
    );
  }
  private async saveAudits(
    verificationId: string,
    role: string,
    audits: GonkaResult[],
    output: unknown,
  ) {
    for (const audit of audits) await this.saveAudit(verificationId, role, audit, output);
  }
  private async stage(v: Verification, stage: string) {
    v.currentStage = stage;
    await this.verifications.save(v);
  }
  private preflightHash(dto: CreateVerificationDto, file?: Express.Multer.File) {
    const value =
      dto.inputType === InputType.TEXT
        ? dto.content?.replace(/\r\n?/g, '\n').trim()
        : dto.inputType === InputType.URL
          ? normalizeUrl(dto.url!)
          : file?.buffer.toString('base64');
    return this.integrity.hash({ type: dto.inputType, value });
  }
  private validateInput(dto: CreateVerificationDto, file?: Express.Multer.File) {
    if (dto.inputType === InputType.TEXT && !dto.content)
      throw new BadRequestException('content is required');
    if (dto.inputType === InputType.URL && !dto.url)
      throw new BadRequestException('url is required');
    if (dto.inputType === InputType.IMAGE && !file)
      throw new BadRequestException('file is required');
  }
  private async latest(inputHash: string) {
    return this.passports.findOne({
      where: { verification: { inputHash, status: VerificationStatus.COMPLETED } },
      order: { version: 'DESC' },
      relations: { verification: true, attestation: true },
    });
  }
  private reusable(passport: Passport) {
    return (
      passport.createdAt >
      new Date(Date.now() - this.config.get('PASSPORT_REUSE_WINDOW_MINUTES', 60) * 60000)
    );
  }
  private async reloadPassport(id: string) {
    const value = await this.passports.findOne({
      where: { id },
      relations: { verification: true, attestation: true },
    });
    if (!value) throw new Error('Passport disappeared');
    return value;
  }
  private publicPassport(passport: Passport): Record<string, unknown> {
    const attestation = passport.attestation
      ? {
          status: passport.attestation.status,
          network: passport.attestation.network,
          chainId: passport.attestation.chainId,
          contractAddress: passport.attestation.contractAddress,
          transactionHash: passport.attestation.transactionHash,
          blockNumber: passport.attestation.blockNumber
            ? Number(passport.attestation.blockNumber)
            : null,
          attestor: passport.attestation.attestor,
          explorerUrl: passport.attestation.transactionHash
            ? `${this.config.get('ATTESTATION_EXPLORER_URL')}/tx/${passport.attestation.transactionHash}`
            : null,
        }
      : null;
    return {
      ...passport.canonicalPayload,
      integrity: {
        ...(passport.canonicalPayload.integrity as object),
        passportHash: passport.passportHash,
      },
      attestation,
    };
  }
  private publicId() {
    return `pm_${randomBytes(9).toString('base64url')}`;
  }
  private flattenAudits(audits: GonkaResult[]): GonkaResult[] {
    return audits.flatMap((audit) => [...this.flattenAudits(audit.relatedAudits ?? []), audit]);
  }
}
