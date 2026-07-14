import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attestation, ModelResponse, Passport } from '../../entities';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { IntegrityModule } from '../integrity/integrity.module';
import { PassportController } from './passport.controller';
import { PassportService } from './passport.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([Passport, Attestation, ModelResponse]),
    BlockchainModule,
    IntegrityModule,
  ],
  controllers: [PassportController],
  providers: [PassportService],
  exports: [PassportService],
})
export class PassportModule {}
