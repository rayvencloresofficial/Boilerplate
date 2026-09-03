import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables: check local package .env first, then root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:5000/api/v1'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is required. Please set it in admin/backend/.env',
  }).min(1, 'DATABASE_URL cannot be empty.'),
  JWT_SECRET: z.string().min(16).default('super-secret-jwt-key-for-development-change-in-production-12345'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16)
    .default('super-secret-refresh-jwt-key-for-development-change-in-prod-67890'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const ENV = parsed.data;
