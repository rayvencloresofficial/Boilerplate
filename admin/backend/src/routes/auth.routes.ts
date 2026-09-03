import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { loginSchema, registerSchema, refreshSchema } from '../validations/auth.validation.js';
import { authRateLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/register', authRateLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/refresh', validateRequest({ body: refreshSchema }), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);
router.get('/demo-accounts', authController.getDemoAccounts);
router.post('/demo-login', authController.demoLogin);

export default router;
