import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Verification } from './verification.entity';

@Entity('model_responses')
@Index(['verificationId', 'agentRole'])
export class ModelResponse {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @ManyToOne(() => Verification, (verification) => verification.modelResponses, {
    onDelete: 'CASCADE',
  })
  verification!: Verification;
  @Column({ type: 'uuid' }) verificationId!: string;
  @Column({ type: 'uuid', nullable: true }) claimId!: string | null;
  @Column({ type: 'varchar', length: 40 }) agentRole!: string;
  @Column({ type: 'varchar', length: 128 }) modelId!: string;
  @Column({ type: 'varchar', length: 255 }) gonkaResponseId!: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) providerRequestId!: string | null;
  @Column({ type: 'jsonb' }) parsedOutput!: unknown;
  @Column({ type: 'text', nullable: true }) rawOutput!: string | null;
  @Column({ type: 'varchar', length: 66 }) outputHash!: string;
  @Column({ type: 'int', default: 0 }) inputTokens!: number;
  @Column({ type: 'int', default: 0 }) outputTokens!: number;
  @Column({ type: 'int' }) latencyMs!: number;
  @Column({ type: 'smallint', default: 0 }) retryCount!: number;
  @CreateDateColumn() createdAt!: Date;
}
