import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Mesh-API');

  app.setGlobalPrefix(config.get('API_PREFIX', 'api/v1'));

  app.use(
    (
      req: { traceId?: string },
      res: { setHeader(name: string, value: string): void },
      next: () => void,
    ) => {
      req.traceId = randomUUID();
      res.setHeader('x-trace-id', req.traceId);
      next();
    },
  );
  app.use(helmet());
  app.enableCors({
    origin: config
      .get('WEB_ORIGINS', 'http://localhost:3000')
      .split(',')
      .map((value: string) => value.trim()),
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.useStaticAssets(resolve(config.get('UPLOAD_DIR', './uploads')), { prefix: '/uploads/' });
  app.enableShutdownHooks();

  if (config.get('SWAGGER_ENABLED', true)) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Mesh Evidence Passport API')
        .setDescription('Synchronous multi-model evidence verification through Gonka Router')
        .setVersion('1.0.0')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(config.get('PORT', 4000));
  logger.log(`🚀 Mesh API is running on port ${config.get('PORT', 4000)}`);
}
void bootstrap();
