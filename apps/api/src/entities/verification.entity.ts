import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Claim } from './claim.entity';
import { ModelResponse } from './model-response.entity';
import { Passport } from './passport.entity';

export enum InputType {
  URL = 'url',
  TWEET = 'tweet',
  TEXT = 'text',
  IMAGE = 'image',
}

export enum VerificationStatus {
  PENDING = 'pending',
  EXTRACTING = 'extracting',
  VERIFYING = 'verifying',
  ATTESTING = 'attesting',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: InputType })
  inputType!: InputType;

  @Column({ type: 'text' })
  originalInput!: string;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  status!: VerificationStatus;

  /** 0-100 aggregate truth score produced by the ConsensusService. */
  @Column({ type: 'float', nullable: true })
  truthScore!: number | null;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @ManyToOne(() => User, (u) => u.verifications, { nullable: true, onDelete: 'SET NULL' })
  user!: User | null;

  @OneToMany(() => Claim, (c) => c.verification, { cascade: true })
  claims!: Claim[];

  @OneToMany(() => ModelResponse, (m) => m.verification, { cascade: true })
  modelResponses!: ModelResponse[];

  @OneToOne(() => Passport, (p) => p.verification)
  passport!: Passport;

  @CreateDateColumn()
  createdAt!: Date;
}
