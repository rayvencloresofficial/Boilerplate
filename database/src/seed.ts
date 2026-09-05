import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ensureDatabaseExists, createPool, getDatabaseUrl } from './client.js';
import { encrypt } from './utils/crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeeds(): Promise<void> {
  console.log('\n🌱 Starting Database Seeding...');
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
    const seedersDir = path.resolve(__dirname, '../seeders');
    if (!fs.existsSync(seedersDir)) {
      console.error(`❌ Seeders directory not found at: ${seedersDir}`);
      process.exit(1);
    }

    const files = fs
      .readdirSync(seedersDir)
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length === 0) {
      console.log('ℹ️  No seeder files found in database/seeders.\n');
      return;
    }

    console.log(`🚀 Found ${files.length} seeder file(s) to execute:\n`);

    for (const file of files) {
      const filePath = path.join(seedersDir, file);
      let sql = fs.readFileSync(filePath, 'utf8');

      // Expand {{ENCRYPT:plaintext}} template placeholders dynamically at seed time
      sql = sql.replace(/\{\{ENCRYPT:([^}]+)\}\}/g, (_match, rawValue) => {
        return encrypt(rawValue);
      });

      const startTime = Date.now();
      process.stdout.write(`  ⏳ Seeding ${file}... `);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('COMMIT');
        const duration = Date.now() - startTime;
        process.stdout.write(`✅ Done (${duration}ms)\n`);
      } catch (seedErr) {
        await client.query('ROLLBACK');
        process.stdout.write('❌ FAILED\n');
        console.error(`\n❌ Error in seeder "${file}":`, seedErr);
        throw seedErr;
      }
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🔑 Demo Persona Accounts Ready:');
    console.log('  👑 Super Admin: superadmin@example.com / Password123!');
    console.log('  🛡️ Admin:       admin@example.com      / Password123!');
    console.log('  💼 Manager:     manager@example.com    / Password123!');
    console.log('  👤 User:        user@example.com       / Password123!\n');
  } catch (err) {
    console.error('\n❌ Seeding process aborted due to error.');
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeeds();
}
