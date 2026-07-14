import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Passport } from './passport.entity';

export enum AttestationStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  DISABLED = 'DISABLED',
}

@Entity('attestations')
export class Attestation {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @OneToOne(() => Passport, (passport) => passport.attestation, { onDelete: 'CASCADE' })
  @JoinColumn()
  passport!: Passport;
  @Column({ type: 'uuid', unique: true }) passportId!: string;
  @Column({ type: 'enum', enum: AttestationStatus }) status!: AttestationStatus;
  @Column({ type: 'varchar', length: 32, default: 'ethereum-sepolia' }) network!: string;
  @Column({ type: 'int', default: 11155111 }) chainId!: number;
  @Column({ type: 'varchar', length: 42, nullable: true }) contractAddress!: string | null;
  @Column({ type: 'varchar', length: 66, nullable: true }) transactionHash!: string | null;
  @Column({ type: 'bigint', nullable: true }) blockNumber!: string | null;
  @Column({ type: 'varchar', length: 42, nullable: true }) attestor!: string | null;
  @Column({ type: 'text', nullable: true }) errorMessage!: string | null;
  @Column({ type: 'timestamptz', nullable: true }) attestedAt!: Date | null;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
