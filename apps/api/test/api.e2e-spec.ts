import { BadGatewayException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';
import { PassportController } from '../src/modules/passport/passport.controller';
import { PassportService } from '../src/modules/passport/passport.service';
import { VerificationController } from '../src/modules/verification/verification.controller';
import { VerificationService } from '../src/modules/verification/verification.service';

class FakeVerificationService {
  private version = 0;
  async verify(
    dto: { inputType: string; content?: string; url?: string; forceRefresh?: boolean },
    file?: Express.Multer.File,
  ) {
    if (dto.content === 'timeout') throw new BadGatewayException('Gonka request failed');
    if (dto.forceRefresh || this.version === 0) this.version += 1;
    return {
      schemaVersion: '1.0.0',
      publicId: 'pm_test',
      verificationId: '00000000-0000-4000-8000-000000000001',
      version: this.version,
      input: {
        type: dto.inputType,
        sourceUrl: dto.url ?? null,
        imageUrl: file ? '/uploads/test.png' : null,
      },
      verdict: dto.content === 'opinion' ? 'UNVERIFIED' : 'SUPPORTED',
      truthScore: dto.content === 'opinion' ? 50 : 80,
      claims: dto.content === 'opinion' ? [] : [{ id: 'claim' }],
      attestation: { status: dto.content === 'chain-fail' ? 'FAILED' : 'DISABLED' },
    };
  }
  async getVerification(id: string) {
    return { id, status: 'COMPLETED', currentStage: 'COMPLETED' };
  }
}
class FakePassportService {
  get(id: string) {
    return { publicId: id };
  }
  list() {
    return { items: [], nextCursor: null };
  }
  badge(id: string) {
    return { publicId: id, truthScore: 80 };
  }
  retry(id: string) {
    return { publicId: id, attestation: { status: 'CONFIRMED' } };
  }
  verifyIntegrity(id: string) {
    return {
      publicId: id,
      recomputed: { passportHash: '0x1' },
      stored: { passportHash: '0x1' },
      onChain: null,
      matches: { passportHash: id !== 'mismatch' },
      valid: id !== 'mismatch',
    };
  }
}

describe('Mesh API contract (e2e with deterministic adapters)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [VerificationController, PassportController],
      providers: [
        { provide: VerificationService, useClass: FakeVerificationService },
        { provide: PassportService, useClass: FakePassportService },
        { provide: ConfigService, useValue: new ConfigService({ MAX_IMAGE_BYTES: 5242880 }) },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    await app.init();
  });
  afterAll(() => app.close());
  it('completes text, URL, and image requests', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'TEXT', content: 'Earth is round' })
      .expect(201)
      .expect(({ body }) => expect(body.data.input.type).toBe('TEXT'));
    await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'URL', url: 'https://example.com/a' })
      .expect(201)
      .expect(({ body }) => expect(body.data.input.sourceUrl).toBe('https://example.com/a'));
    await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .field('inputType', 'IMAGE')
      .attach('file', Buffer.from('image'), { filename: 'a.png', contentType: 'image/png' })
      .expect(201)
      .expect(({ body }) => expect(body.data.input.imageUrl).toContain('/uploads/'));
  });
  it('covers no-claim, external failure, failed attestation, integrity mismatch, reuse and refresh', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'TEXT', content: 'opinion' })
      .expect(({ body }) => expect(body.data.claims).toHaveLength(0));
    await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'TEXT', content: 'timeout' })
      .expect(502)
      .expect(({ body }) => expect(body.success).toBe(false));
    await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'TEXT', content: 'chain-fail' })
      .expect(({ body }) => expect(body.data.attestation.status).toBe('FAILED'));
    await request(app.getHttpServer())
      .get('/api/v1/passports/mismatch/integrity')
      .expect(({ body }) => expect(body.data.valid).toBe(false));
    const reused = await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'TEXT', content: 'same' });
    const refreshed = await request(app.getHttpServer())
      .post('/api/v1/verifications')
      .send({ inputType: 'TEXT', content: 'same', forceRefresh: true });
    expect(refreshed.body.data.version).toBe(reused.body.data.version + 1);
  });
});
