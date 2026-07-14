import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attestation } from './attestation.entity';
import { Verdict } from './claim.entity';
import { Verification } from './verification.entity';

@Entity('passports')
@Index(['publicId'], { unique: true })
@Index(['createdAt'])
export class Passport {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'varchar', length: 40, unique: true }) publicId!: string;
  @OneToOne(() => Verification, (verification) => verification.passport, { onDelete: 'CASCADE' })
  @JoinColumn()
  verification!: Verification;
  @Column({ type: 'uuid', unique: true }) verificationId!: string;
  @Column({ type: 'smallint' }) version!: number;
  @Column({ type: 'uuid', nullable: true }) previousPassportId!: string | null;
  @Column({ type: 'varchar', length: 20, default: '1.0.0' }) schemaVersion!: string;
  @Column({ type: 'enum', enum: Verdict }) verdict!: Verdict;
  @Column({ type: 'smallint' }) truthScore!: number;
  @Column({ type: 'smallint' }) confidenceScore!: number;
  @Column({ type: 'text' }) summary!: string;
  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" }) disagreementSummary!: string[];
  @Column({ type: 'jsonb' }) canonicalPayload!: Record<string, unknown>;
  @Column({ type: 'varchar', length: 66 }) claimsRoot!: string;
  @Column({ type: 'varchar', length: 66 }) evidenceRoot!: string;
  @Column({ type: 'varchar', length: 66 }) kimiOutputHash!: string;
  @Column({ type: 'varchar', length: 66 }) minimaxOutputHash!: string;
  @Column({ type: 'varchar', length: 66 }) requestIdsHash!: string;
  @Column({ type: 'varchar', length: 66 }) passportHash!: string;
  @OneToOne(() => Attestation, (attestation) => attestation.passport, { cascade: true })
  attestation!: Attestation | null;
  @CreateDateColumn() createdAt!: Date;
}
