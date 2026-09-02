import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission } from '../middlewares/auth/authorization.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createSettingSchema,
  updateSettingSchema,
  settingKeyParamSchema,
  settingsFilterQuerySchema,
} from '../validations/settings.validation.js';

const router = Router();

// Public endpoint for frontend initialization (brand color, maintenance mode, app title)
router.get('/public', settingsController.getPublicSettings);

// Authenticated & permission-gated endpoints
router.use(authenticate);

router.get(
  '/',
  requirePermission('settings:read'),
  validateRequest({ query: settingsFilterQuerySchema }),
  settingsController.getSettings,
);

router.get(
  '/:key',
  requirePermission('settings:read'),
  validateRequest({ params: settingKeyParamSchema }),
  settingsController.getSettingByKey,
);

router.post(
  '/',
  requirePermission('settings:manage'),
  validateRequest({ body: createSettingSchema }),
  settingsController.createSetting,
);

router.put(
  '/:key',
  requirePermission('settings:manage'),
  validateRequest({ params: settingKeyParamSchema, body: updateSettingSchema }),
  settingsController.updateSetting,
);

router.delete(
  '/:key',
  requirePermission('settings:manage'),
  validateRequest({ params: settingKeyParamSchema }),
  settingsController.deleteSetting,
);

export default router;
