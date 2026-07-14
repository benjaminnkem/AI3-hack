import { Module } from '@nestjs/common';
import { GonkaModule } from '../gonka/gonka.module';
import { InvestigationService } from './investigation.service';
@Module({
  imports: [GonkaModule],
  providers: [InvestigationService],
  exports: [InvestigationService],
})
export class InvestigationModule {}
