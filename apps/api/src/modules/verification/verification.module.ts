import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Attestation,
  Claim,
  Evidence,
  ModelResponse,
  Passport,
  Verification,
} from '../../entities';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ClaimExtractionModule } from '../claim-extraction/claim-extraction.module';
import { ConsensusModule } from '../consensus/consensus.module';
import { EvidenceModule } from '../evidence/evidence.module';
import { IngestionModule } from '../ingestion/ingestion.module';
import { IntegrityModule } from '../integrity/integrity.module';
import { InvestigationModule } from '../investigation/investigation.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Verification, Claim, Evidence, ModelResponse, Passport, Attestation]),
    BlockchainModule,
    ClaimExtractionModule,
    ConsensusModule,
    EvidenceModule,
    IngestionModule,
    IntegrityModule,
    InvestigationModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
