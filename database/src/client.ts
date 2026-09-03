import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool, Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables: check database/.env first, then ../backend/.env
const databaseEnvPath = path.resolve(__dirname, '../.env');
const backendEnvPath = path.resolve(__dirname, '../../backend/.env');

if (fs.existsSync(databaseEnvPath)) {
  dotenv.config({ path: databaseEnvPath });
}
if (!process.env.DATABASE_URL && fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

// Sanitize any invalid PGPORT environment variable to prevent NaN errors
if (process.env.PGPORT && isNaN(parseInt(process.env.PGPORT, 10))) {
  delete process.env.PGPORT;
}

export function normalizeDatabaseUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    if (!parsed.port) {
      parsed.port = '5432';
    }
    return parsed.toString();
  } catch {
    return urlStr;
  }
}

export function getDatabaseUrl(): string {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      '❌ DATABASE_URL is not defined. Please configure DATABASE_URL in database/.env or backend/.env.'
    );
  }

  return normalizeDatabaseUrl(process.env.DATABASE_URL);
}

export function parseDatabaseTarget(urlStr: string): { baseServerUrl: string; dbName: string } {
  const parsed = new URL(urlStr);
  const dbName = parsed.pathname.replace(/^\//, '');
  if (!dbName) {
    throw new Error('❌ DATABASE_URL must include a target database name (e.g. postgresql://user:pass@host:5432/dbname).');
  }

  // Construct URL pointing to default 'postgres' database for admin operations
  parsed.pathname = '/postgres';
  return {
    baseServerUrl: parsed.toString(),
    dbName,
  };
}

export function getSslConfig(urlStr: string): boolean | { rejectUnauthorized: boolean } {
  if (process.env.DATABASE_SSL === 'true' || process.env.PGSSLMODE === 'require') {
    return { rejectUnauthorized: false };
  }
  if (process.env.DATABASE_SSL === 'false' || process.env.PGSSLMODE === 'disable') {
    return false;
  }
  try {
    const parsed = new URL(urlStr);
    const sslmode = parsed.searchParams.get('sslmode');
    const ssl = parsed.searchParams.get('ssl');
    if (ssl === 'true' || (sslmode && sslmode !== 'disable')) {
      return { rejectUnauthorized: false };
    }
    const hostname = parsed.hostname;
    // Local development hosts don't use SSL by default
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === 'postgres' ||
      hostname === 'host.docker.internal' ||
      !hostname.includes('.')
    ) {
      return false;
    }
    // Remote hostnames (such as render.com, supabase.co, neon.tech, aws, etc.) require SSL
    return { rejectUnauthorized: false };
  } catch {
    return false;
  }
}

/**
 * Ensures the target PostgreSQL database exists.
 * If it doesn't exist, connects to the default 'postgres' database and creates it.
 */
export async function ensureDatabaseExists(): Promise<void> {
  const targetUrl = getDatabaseUrl();
  const { baseServerUrl, dbName } = parseDatabaseTarget(targetUrl);
  const ssl = getSslConfig(targetUrl);

  const testPool = new Pool({ connectionString: targetUrl, connectionTimeoutMillis: 5000, ssl });
  try {
    const client = await testPool.connect();
    client.release();
    await testPool.end();
  } catch (err: unknown) {
    await testPool.end().catch(() => {});
    
    const pgError = err as { code?: string; message?: string };
    // 3D000 is PostgreSQL error code for "database does not exist"
    if (pgError.code === '3D000') {
      console.log(`ℹ️  Database "${dbName}" does not exist. Creating it now...`);
      const adminClient = new Client({ connectionString: baseServerUrl, ssl });
      try {
        await adminClient.connect();
        // Safe identifier escaping
        await adminClient.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
        console.log(`✨ Database "${dbName}" created successfully.`);
      } catch (adminErr: unknown) {
        console.error(`❌ Failed to auto-create database "${dbName}":`, (adminErr as Error).message);
        throw adminErr;
      } finally {
        await adminClient.end().catch(() => {});
      }
    } else {
      // If it's a connection/credential error, surface it with helpful diagnostic advice
      throw err;
    }
  }
}

export function createPool(): pg.Pool {
  const targetUrl = getDatabaseUrl();
  const ssl = getSslConfig(targetUrl);
  return new Pool({
    connectionString: targetUrl,
    ssl,
  });
}

