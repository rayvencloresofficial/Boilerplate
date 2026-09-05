import { Router } from 'express';
import { z } from 'zod';
import * as cryptoController from '../controllers/crypto.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission } from '../middlewares/auth/authorization.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';

const router = Router();

const encryptSchema = z.object({
  data: z.unknown().refine((val) => val !== undefined, { message: 'Data is required.' }),
});

const decryptSchema = z.object({
  ciphertext: z.string().min(1, 'Ciphertext is required.'),
});

router.use(authenticate);

router.post(
  '/encrypt',
  requirePermission('settings:manage'),
  validateRequest({ body: encryptSchema }),
  cryptoController.encryptData
);

router.post(
  '/decrypt',
  requirePermission('settings:manage'),
  validateRequest({ body: decryptSchema }),
  cryptoController.decryptData
);

export default router;
