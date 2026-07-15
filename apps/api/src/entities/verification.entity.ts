import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Claim } from './claim.entity';
import { ModelResponse } from './model-response.entity';
import { Passport } from './passport.entity';

export enum InputType {
  TEXT = 'TEXT',
  URL = 'URL',
  IMAGE = 'IMAGE',
}

export enum VerificationStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('verifications')
@Index(['inputHash', 'status', 'completedAt'])
@Index(['createdAt'])
export class Verification {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'enum', enum: InputType })
  inputType!: InputType;
  @Column({ type: 'text', nullable: true })
  originalText!: string | null;

  @Column({ type: 'text', nullable: true })
  sourceUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text' })
  normalizedContent!: string;

  @Column({ type: 'varchar', length: 66 })
  inputHash!: string;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PROCESSING })
  status!: VerificationStatus;

  @Column({ type: 'varchar', length: 64, default: 'INGESTION' })
  currentStage!: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  errorCode!: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @OneToMany(() => Claim, (claim) => claim.verification, { cascade: true })
  claims!: Claim[];

  @OneToMany(() => ModelResponse, (response) => response.verification, { cascade: true })
  modelResponses!: ModelResponse[];

  @OneToOne(() => Passport, (passport) => passport.verification)
  passport!: Passport | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
