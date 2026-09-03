import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission } from '../middlewares/auth/authorization.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createUserSchema, updateUserSchema, userIdParamSchema } from '../validations/user.validation.js';

const router = Router();

// All user management routes require valid authentication
router.use(authenticate);

router.get('/', requirePermission('users:read'), userController.getUsers);
router.get('/:id', requirePermission('users:read'), validateRequest({ params: userIdParamSchema }), userController.getUserById);
router.post('/', requirePermission('users:create'), validateRequest({ body: createUserSchema }), userController.createUser);
router.put('/:id', requirePermission('users:update'), validateRequest({ params: userIdParamSchema, body: updateUserSchema }), userController.updateUser);
router.delete('/:id', requirePermission('users:delete'), validateRequest({ params: userIdParamSchema }), userController.deleteUser);

export default router;
