import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { pool } from './config/database.js';

const app = createApp();

const server = app.listen(ENV.PORT, () => {
  console.log(`[auth-service] Running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
  console.log(`[auth-service] Health check: http://localhost:${ENV.PORT}/health`);
  console.log(`[auth-service] Auth API: http://localhost:${ENV.PORT}/api/v1/auth`);
});

const gracefulShutdown = (signal: string) => {
  console.log(`\n[auth-service] Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('[auth-service] HTTP server closed.');
    try {
      await pool.end();
      console.log('[auth-service] Database pool drained.');
      process.exit(0);
    } catch (err) {
      console.error('[auth-service] Error during database disconnect:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Reloaded with active database configuration

