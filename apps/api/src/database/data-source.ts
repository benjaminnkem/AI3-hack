import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { entities } from '../entities';

config();

/** Standalone DataSource for TypeORM CLI (migrations). */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
