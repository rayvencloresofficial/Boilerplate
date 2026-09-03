import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { ENV } from './env.js';
import type { Database } from '../types/database.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  max: 20, // Max concurrent client connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 5000, // Return an error after 5s if connection cannot be established
  ssl:
    ENV.NODE_ENV === 'production' && !ENV.DATABASE_URL.includes('localhost')
      ? { rejectUnauthorized: false }
      : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});
