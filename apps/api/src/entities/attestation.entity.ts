import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Passport } from './passport.entity';

@Entity('attestations')
export class Attestation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Passport, (p) => p.attestations, { onDelete: 'CASCADE' })
  passport!: Passport;

  @Column({ type: 'uuid' })
  passportId!: string;

  @Column({ type: 'varchar', length: 66, nullable: true })
  transactionHash!: string | null;

  @Column({ type: 'bigint', nullable: true })
  blockNumber!: string | null;

  @Column({ type: 'int', nullable: true })
  chainId!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}
