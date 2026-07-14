import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Verification } from './verification.entity';
import { Evidence } from './evidence.entity';

export enum ClaimStatus {
  SUPPORTED = 'supported',
  CONTRADICTED = 'contradicted',
  UNVERIFIABLE = 'unverifiable',
  MIXED = 'mixed',
}

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Verification, (v) => v.claims, { onDelete: 'CASCADE' })
  verification!: Verification;

  @Column({ type: 'uuid' })
  verificationId!: string;

  @Column({ type: 'text' })
  claim!: string;

  /** Model-assigned confidence 0-1 that this is a checkable factual claim. */
  @Column({ type: 'float', default: 0 })
  confidence!: number;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.UNVERIFIABLE })
  status!: ClaimStatus;

  @OneToMany(() => Evidence, (e) => e.claim, { cascade: true })
  evidence!: Evidence[];
}
