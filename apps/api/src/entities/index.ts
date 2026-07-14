export * from './user.entity';
export * from './verification.entity';
export * from './claim.entity';
export * from './evidence.entity';
export * from './model-response.entity';
export * from './passport.entity';
export * from './attestation.entity';

import { User } from './user.entity';
import { Verification } from './verification.entity';
import { Claim } from './claim.entity';
import { Evidence } from './evidence.entity';
import { ModelResponse } from './model-response.entity';
import { Passport } from './passport.entity';
import { Attestation } from './attestation.entity';

/** Explicit list of entity classes for TypeORM (excludes enums). */
export const entities = [
  User,
  Verification,
  Claim,
  Evidence,
  ModelResponse,
  Passport,
  Attestation,
];
