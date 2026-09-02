import * as documentRepo from '../repositories/document.repository.js';
import { NotFoundError } from '../errors/AppError.js';
import type {
  DocumentItem,
  DocumentFilter,
  CreateDocumentDto,
  UpdateDocumentDto,
} from '../types/document.js';

/**
 * Lists all documents matching the optional filter criteria.
 */
export const listDocuments = async (filter?: DocumentFilter): Promise<DocumentItem[]> => {
  return await documentRepo.findAll(filter);
};

/**
 * Retrieves a single document by its UUID.
 */
export const getDocumentById = async (id: string): Promise<DocumentItem> => {
  const document = await documentRepo.findById(id);
  if (!document) {
    throw new NotFoundError('Document', id);
  }
  return document;
};

/**
 * Creates and publishes a new document.
 */
export const publishDocument = async (
  data: CreateDocumentDto,
  userId?: string
): Promise<DocumentItem> => {
  return await documentRepo.create({
    ...data,
    created_by: userId ?? null,
  });
};

/**
 * Updates an existing document by its UUID.
 */
export const editDocument = async (
  id: string,
  data: UpdateDocumentDto
): Promise<DocumentItem> => {
  // Ensure document exists
  await getDocumentById(id);

  const updated = await documentRepo.update(id, data);
  if (!updated) {
    throw new NotFoundError('Document', id);
  }
  return updated;
};

/**
 * Deletes a document by its UUID.
 */
export const removeDocument = async (id: string): Promise<void> => {
  // Ensure document exists
  await getDocumentById(id);

  const deleted = await documentRepo.deleteById(id);
  if (!deleted) {
    throw new NotFoundError('Document', id);
  }
};
