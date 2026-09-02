import { Router } from 'express';
import * as documentController from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/auth/authentication.middleware.js';
import { requirePermission } from '../middlewares/auth/authorization.middleware.js';
import { validateRequest } from '../middlewares/validate.middleware.js';
import {
  createDocumentSchema,
  updateDocumentSchema,
  documentIdParamSchema,
  documentFilterQuerySchema,
} from '../validations/document.validation.js';

const router = Router();

// All documents routes require authentication
router.use(authenticate);

router.get(
  '/',
  requirePermission('documents:read'),
  validateRequest({ query: documentFilterQuerySchema }),
  documentController.getDocuments
);

router.get(
  '/:id',
  requirePermission('documents:read'),
  validateRequest({ params: documentIdParamSchema }),
  documentController.getDocumentById
);

router.post(
  '/',
  requirePermission('documents:create'),
  validateRequest({ body: createDocumentSchema }),
  documentController.createDocument
);

router.put(
  '/:id',
  requirePermission('documents:create'),
  validateRequest({ params: documentIdParamSchema, body: updateDocumentSchema }),
  documentController.updateDocument
);

router.delete(
  '/:id',
  requirePermission('documents:delete'),
  validateRequest({ params: documentIdParamSchema }),
  documentController.deleteDocument
);

export default router;
