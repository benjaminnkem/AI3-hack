import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Claim } from './claim.entity';

@Entity('evidence')
export class Evidence {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Claim, (c) => c.evidence, { onDelete: 'CASCADE' })
  claim!: Claim;

  @Column({ type: 'uuid' })
  claimId!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  url!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ type: 'boolean' })
  supportsClaim!: boolean;

  /** 0-1 heuristic credibility weight for the source. */
  @Column({ type: 'float', default: 0.5 })
  credibilityScore!: number;
}
