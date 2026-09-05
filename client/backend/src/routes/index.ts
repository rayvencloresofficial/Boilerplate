import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import permissionRoutes from './permission.routes.js';
import rbacTestRoutes from './rbacTest.routes.js';
import settingsRoutes from './settings.routes.js';
import cryptoRoutes from './crypto.routes.js';
import { db } from '../config/database.js';
import { sql } from 'kysely';

const router = Router();

// Root API Endpoint
router.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Client Backend API',
    version: '1.0.0',
    status: 'ONLINE',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      roles: '/api/v1/roles',
      permissions: '/api/v1/permissions',
      testRbac: '/api/v1/test-rbac',
      settings: '/api/v1/settings',
      crypto: '/api/v1/crypto',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health Check Endpoint
router.get('/health', async (_req, res) => {
  try {
    await sql`SELECT 1`.execute(db);
    res.status(200).json({
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'DEGRADED',
      database: 'DISCONNECTED',
      error: error instanceof Error ? error.message : 'Database error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Mounted API sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/test-rbac', rbacTestRoutes);
router.use('/settings', settingsRoutes);
router.use('/crypto', cryptoRoutes);

export default router;
