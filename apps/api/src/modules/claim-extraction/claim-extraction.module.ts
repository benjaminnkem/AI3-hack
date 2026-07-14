import { Module } from '@nestjs/common';
import { GonkaModule } from '../gonka/gonka.module';
import { ClaimExtractionService } from './claim-extraction.service';

@Module({
  imports: [GonkaModule],
  providers: [ClaimExtractionService],
  exports: [ClaimExtractionService],
})
export class ClaimExtractionModule {}
