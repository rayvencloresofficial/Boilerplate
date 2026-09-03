import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission } from '../middlewares/auth/authorization.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import { createRoleSchema, updateRoleSchema, roleIdParamSchema } from '../validations/role.validation.js';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('roles:read'), roleController.getRoles);
router.get('/:id', requirePermission('roles:read'), validateRequest({ params: roleIdParamSchema }), roleController.getRoleById);
router.post('/', requirePermission('roles:manage'), validateRequest({ body: createRoleSchema }), roleController.createRole);
router.put('/:id', requirePermission('roles:manage'), validateRequest({ params: roleIdParamSchema, body: updateRoleSchema }), roleController.updateRole);
router.delete('/:id', requirePermission('roles:manage'), validateRequest({ params: roleIdParamSchema }), roleController.deleteRole);

export default router;
