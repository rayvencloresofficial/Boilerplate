import { api } from './api';
import type { ApiResponse } from '../types/api';
import type {
  DocumentItem,
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentFilter,
} from '../types/document';

/**
 * Fetch all documents with optional filtering (requires 'documents:read')
 */
export const getDocumentsApi = async (filter?: DocumentFilter): Promise<DocumentItem[]> => {
  const params = new URLSearchParams();
  if (filter?.category) params.append('category', filter.category);
  if (filter?.status) params.append('status', filter.status);
  if (filter?.search) params.append('search', filter.search);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get<ApiResponse<DocumentItem[]>>(`/documents${queryString}`);
  return res.data || [];
};

/**
 * Fetch a single document by its UUID (requires 'documents:read')
 */
export const getDocumentByIdApi = async (id: string): Promise<DocumentItem> => {
  const res = await api.get<ApiResponse<DocumentItem>>(`/documents/${id}`);
  return res.data!;
};

/**
 * Create a new document (requires 'documents:create')
 */
export const createDocumentApi = async (
  payload: CreateDocumentDto
): Promise<DocumentItem> => {
  const res = await api.post<ApiResponse<DocumentItem>>('/documents', payload);
  return res.data!;
};

/**
 * Update an existing document (requires 'documents:create')
 */
export const updateDocumentApi = async (
  id: string,
  payload: UpdateDocumentDto
): Promise<DocumentItem> => {
  const res = await api.put<ApiResponse<DocumentItem>>(`/documents/${id}`, payload);
  return res.data!;
};

/**
 * Delete a document by its UUID (requires 'documents:delete')
 */
export const deleteDocumentApi = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
