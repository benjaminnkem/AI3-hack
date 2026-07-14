import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Evidence } from './evidence.entity';
import { Verification } from './verification.entity';

export enum Verdict {
  SUPPORTED = 'SUPPORTED',
  UNVERIFIED = 'UNVERIFIED',
  MISLEADING = 'MISLEADING',
  CONTRADICTED = 'CONTRADICTED',
}

@Entity('claims')
@Index(['verificationId'])
export class Claim {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Verification, (verification) => verification.claims, { onDelete: 'CASCADE' })
  verification!: Verification;
  @Column({ type: 'uuid' }) verificationId!: string;
  @Column({ type: 'text' }) text!: string;
  @Column({ type: 'text' }) normalizedText!: string;
  @Column({ type: 'text', default: '' }) context!: string;
  @Column({ type: 'smallint' }) importance!: number;
  @Column({ type: 'boolean', default: false }) dateSensitive!: boolean;
  @Column({ type: 'jsonb' }) searchQueries!: string[];
  @Column({ type: 'varchar', length: 66 }) claimHash!: string;
  @Column({ type: 'smallint', default: 50 }) truthScore!: number;
  @Column({ type: 'smallint', default: 0 }) confidenceScore!: number;
  @Column({ type: 'enum', enum: Verdict, default: Verdict.UNVERIFIED }) verdict!: Verdict;
  @Column({ type: 'text', default: '' }) reasoningSummary!: string;
  @OneToMany(() => Evidence, (evidence) => evidence.claim, { cascade: true }) evidence!: Evidence[];
}
