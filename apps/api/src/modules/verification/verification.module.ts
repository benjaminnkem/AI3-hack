import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attestation, Passport, User, Verification } from '../../entities';
import { GonkaModule } from '../gonka/gonka.module';
import { ConsensusModule } from '../consensus/consensus.module';
import { PassportModule } from '../passport/passport.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ClaimExtractionModule } from '../claim-extraction/claim-extraction.module';
import { InputResolverService } from './input-resolver.service';
import { VerificationModelService } from './verification-model.service';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification, User, Passport, Attestation]),
    GonkaModule,
    ConsensusModule,
    PassportModule,
    BlockchainModule,
    ClaimExtractionModule,
  ],
  controllers: [VerificationController],
  providers: [InputResolverService, VerificationModelService, VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
