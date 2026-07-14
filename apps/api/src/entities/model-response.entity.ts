import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Verification } from './verification.entity';

@Entity('model_responses')
export class ModelResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Verification, (v) => v.modelResponses, { onDelete: 'CASCADE' })
  verification!: Verification;

  @Column({ type: 'uuid' })
  verificationId!: string;

  /** Model identifier as routed through Gonka, e.g. "kimi", "minimax". */
  @Column({ type: 'varchar', length: 128 })
  model!: string;

  @Column({ type: 'text' })
  reasoning!: string;

  /** Per-model verdict score 0-100. */
  @Column({ type: 'float' })
  confidence!: number;

  /** Gonka Router request id, surfaced in the passport for auditability. */
  @Column({ type: 'varchar', length: 256, nullable: true })
  requestId!: string | null;
}
