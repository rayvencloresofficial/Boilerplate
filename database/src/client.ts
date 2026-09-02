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

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.PGUSER || 'postgres';
  const pass = process.env.PGPASSWORD || 'postgrespassword';
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || '5432';
  const db = process.env.PGDATABASE || 'boilerplate_db';

  return `postgresql://${user}:${pass}@${host}:${port}/${db}`;
}

export function parseDatabaseTarget(urlStr: string): { baseServerUrl: string; dbName: string } {
  try {
    const parsed = new URL(urlStr);
    const dbName = parsed.pathname.replace(/^\//, '') || 'boilerplate_db';
    
    // Construct URL pointing to default 'postgres' database for admin operations
    parsed.pathname = '/postgres';
    return {
      baseServerUrl: parsed.toString(),
      dbName,
    };
  } catch {
    return {
      baseServerUrl: 'postgresql://postgres:postgrespassword@localhost:5432/postgres',
      dbName: 'boilerplate_db',
    };
  }
}

/**
 * Ensures the target PostgreSQL database exists.
 * If it doesn't exist, connects to the default 'postgres' database and creates it.
 */
export async function ensureDatabaseExists(): Promise<void> {
  const targetUrl = getDatabaseUrl();
  const { baseServerUrl, dbName } = parseDatabaseTarget(targetUrl);

  const testPool = new Pool({ connectionString: targetUrl, connectionTimeoutMillis: 3000 });
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
      const adminClient = new Client({ connectionString: baseServerUrl });
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
  return new Pool({
    connectionString: getDatabaseUrl(),
  });
}
