import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Verification } from './verification.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 66, unique: true, nullable: true })
  walletAddress!: string | null;

  @OneToMany(() => Verification, (v) => v.user)
  verifications!: Verification[];

  @CreateDateColumn()
  createdAt!: Date;
}
