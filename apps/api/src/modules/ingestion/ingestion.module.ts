import { Module } from '@nestjs/common';
import { EvidenceModule } from '../evidence/evidence.module';
import { GonkaModule } from '../gonka/gonka.module';
import { StorageModule } from '../storage/storage.module';
import { IngestionService } from './ingestion.service';
@Module({
  imports: [EvidenceModule, GonkaModule, StorageModule],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule {}
