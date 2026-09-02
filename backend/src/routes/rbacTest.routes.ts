import { Router } from 'express';
import * as rbacTestController from '../controllers/rbacTest.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requireRole, requirePermission } from '../middlewares/auth/authorization.middleware.js';

const router = Router();

router.use(authenticate);

// Role-based test endpoints
router.get('/super-admin', requireRole('super_admin'), rbacTestController.testSuperAdminOnly);
router.get('/admin-area', requireRole('super_admin', 'admin'), rbacTestController.testAdminArea);

// Fine-grained permission test endpoints
router.post('/user-create', requirePermission('users:create'), rbacTestController.testUserCreate);
router.delete('/user-delete', requirePermission('users:delete'), rbacTestController.testUserDelete);
router.post('/roles-manage', requirePermission('roles:manage'), rbacTestController.testRolesManage);
router.get('/analytics-read', requirePermission('analytics:read'), rbacTestController.testAnalyticsRead);
router.put('/settings-manage', requirePermission('settings:manage'), rbacTestController.testSettingsManage);

// Example Module (documents) test endpoints
router.get('/documents-read', requirePermission('documents:read'), rbacTestController.testDocumentsRead);
router.post('/documents-create', requirePermission('documents:create'), rbacTestController.testDocumentsCreate);

export default router;
