import { Router } from 'express';
import * as permissionController from '../controllers/permission.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', permissionController.getPermissions);

export default router;
