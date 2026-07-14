import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnvironment } from './config/env';
import { entities } from './entities';
import { HealthModule } from './modules/health/health.module';
import { PassportModule } from './modules/passport/passport.module';
import { VerificationModule } from './modules/verification/verification.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { ttl: config.get('RATE_LIMIT_TTL_MS', 60000), limit: config.get('RATE_LIMIT_MAX', 20) },
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow('DATABASE_URL'),
        entities,
        synchronize: config.get('NODE_ENV') === 'test',
        migrationsRun: false,
        logging: false,
      }),
    }),
    HealthModule,
    VerificationModule,
    PassportModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
