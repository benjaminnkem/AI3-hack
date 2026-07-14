import { Column, CreateDateColumn, Entity, OneToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Verification } from './verification.entity';
import { Attestation } from './attestation.entity';

@Entity('passports')
export class Passport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Verification, (v) => v.passport, { onDelete: 'CASCADE' })
  @JoinColumn()
  verification!: Verification;

  @Column({ type: 'uuid' })
  verificationId!: string;

  /** keccak256 of the canonical passport JSON. Anchored on-chain. */
  @Column({ type: 'varchar', length: 66 })
  passportHash!: string;

  /** Short shareable id for the public verification page. */
  @Column({ type: 'varchar', length: 32, unique: true })
  publicId!: string;

  @OneToMany(() => Attestation, (a) => a.passport, { cascade: true })
  attestations!: Attestation[];

  @CreateDateColumn()
  createdAt!: Date;
}
