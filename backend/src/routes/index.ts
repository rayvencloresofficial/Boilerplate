import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import roleRoutes from './role.routes.js';
import permissionRoutes from './permission.routes.js';
import rbacTestRoutes from './rbacTest.routes.js';
import settingsRoutes from './settings.routes.js';
import documentRoutes from './document.routes.js';
import { db } from '../config/database.js';
import { sql } from 'kysely';

const router = Router();

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
router.use('/documents', documentRoutes);

export default router;
