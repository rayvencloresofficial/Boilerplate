import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  loginSchema,
  registerSchema,
  refreshSchema,
  demoLoginSchema,
  verifyTokenSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/login', validateRequest({ body: loginSchema }), authController.login);
router.post('/register', validateRequest({ body: registerSchema }), authController.register);
router.post('/refresh', validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.post('/verify', validateRequest({ body: verifyTokenSchema }), authController.verifyToken);
router.get('/demo-accounts', authController.getDemoAccounts);
router.post('/demo-login', validateRequest({ body: demoLoginSchema }), authController.demoLogin);

export default router;
