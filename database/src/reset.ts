import { fileURLToPath } from 'url';
import { runMigrations } from './migrate.js';
import { runSeeds } from './seed.js';

export async function resetDatabase(): Promise<void> {
  console.log('🔄 Running complete database reset (migrate + seed)...');
  await runMigrations();
  await runSeeds();
  console.log('✨ Complete database setup finished!\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase();
}
