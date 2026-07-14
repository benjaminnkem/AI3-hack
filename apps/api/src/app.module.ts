import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { VerificationModule } from './modules/verification/verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities,
        // synchronize is convenient for the hackathon; use migrations in prod.
        synchronize: process.env.NODE_ENV !== 'production',
        autoLoadEntities: true,
      }),
    }),
    VerificationModule,
  ],
})
export class AppModule {}
