import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { ENV } from './env.js';
import type { Database } from '../types/database.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl:
    ENV.NODE_ENV === 'production' && !ENV.DATABASE_URL.includes('localhost')
      ? { rejectUnauthorized: false }
      : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client in auth-service', err);
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});
