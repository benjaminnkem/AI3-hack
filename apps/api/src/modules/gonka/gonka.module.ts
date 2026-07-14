import { Module } from '@nestjs/common';
import { GonkaClient } from './gonka.client';

@Module({
  providers: [GonkaClient],
  exports: [GonkaClient],
})
export class GonkaModule {}
