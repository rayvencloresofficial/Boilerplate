import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables: check local package .env first, then root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not set. Please define it in services/auth-service/.env');
  process.exit(1);
}

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-jwt-secret-replace-in-prod',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-replace-in-prod',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
} as const;
