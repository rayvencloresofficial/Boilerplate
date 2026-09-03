import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validateRequest({ body: updateProfileSchema }), userController.updateProfile);
router.get('/:id', validateRequest({ params: userIdParamSchema }), userController.getUserById);

export default router;
