import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ensureDatabaseExists, createPool, getDatabaseUrl } from './client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  console.log('\n📦 Starting Database Migrations...');
  console.log(`🔗 Target: ${getDatabaseUrl().replace(/:[^:@]+@/, ':****@')}`);

  try {
    await ensureDatabaseExists();
  } catch (error: unknown) {
    const err = error as Error & { code?: string };
    console.error(`\n❌ Failed to connect to PostgreSQL: ${err.message}`);
    if (err.code === '28P01') {
      console.error('👉 Hint: Authentication failed. Please check your PostgreSQL password in database/.env or backend/.env.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('👉 Hint: PostgreSQL service is not reachable on the configured host/port.');
    }
    process.exit(1);
  }

  const pool = createPool();
  const client = await pool.connect();

  try {
    // 1. Ensure migrations tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Fetch already applied migrations
    const appliedResult = await client.query<{ name: string }>(
      'SELECT name FROM _migrations ORDER BY id ASC'
    );
    const appliedNames = new Set(appliedResult.rows.map((r) => r.name));

    // 3. Read migration files from database/migrations
    const migrationsDir = path.resolve(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error(`❌ Migrations directory not found at: ${migrationsDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const pendingFiles = files.filter((f) => !appliedNames.has(f));

    if (pendingFiles.length === 0) {
      console.log('✅ Database is already up to date. No pending migrations.\n');
      return;
    }

    console.log(`🚀 Found ${pendingFiles.length} pending migration(s) to execute:\n`);

    for (const file of pendingFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      const startTime = Date.now();
      process.stdout.write(`  ⏳ Executing ${file}... `);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        const duration = Date.now() - startTime;
        process.stdout.write(`✅ Done (${duration}ms)\n`);
      } catch (migrationErr) {
        await client.query('ROLLBACK');
        process.stdout.write('❌ FAILED\n');
        console.error(`\n❌ Error in migration "${file}":`, migrationErr);
        throw migrationErr;
      }
    }

    console.log('\n🎉 All migrations applied successfully!\n');
  } catch (err) {
    console.error('\n❌ Migration process aborted due to error.');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}
