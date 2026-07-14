import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Claim } from './claim.entity';

export enum EvidenceDirection {
  SUPPORTS = 'SUPPORTS',
  OPPOSES = 'OPPOSES',
  NEUTRAL = 'NEUTRAL',
}

@Entity('evidence')
@Index(['claimId'])
@Index(['canonicalUrl'])
export class Evidence {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Claim, (claim) => claim.evidence, { onDelete: 'CASCADE' }) claim!: Claim;
  @Column({ type: 'uuid' }) claimId!: string;
  @Column({ type: 'text' }) title!: string;
  @Column({ type: 'text' }) url!: string;
  @Column({ type: 'text' }) canonicalUrl!: string;
  @Column({ type: 'varchar', length: 255 }) domain!: string;
  @Column({ type: 'text' }) excerpt!: string;
  @Column({ type: 'timestamptz', nullable: true }) publishedAt!: Date | null;
  @Column({ type: 'timestamptz' }) retrievedAt!: Date;
  @Column({ type: 'enum', enum: EvidenceDirection, default: EvidenceDirection.NEUTRAL })
  direction!: EvidenceDirection;
  @Column({ type: 'float' }) tavilyRelevanceScore!: number;
  @Column({ type: 'smallint', default: 0 }) sourceQualityScore!: number;
  @Column({ type: 'varchar', length: 66 }) contentHash!: string;
}
