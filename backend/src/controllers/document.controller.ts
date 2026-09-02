import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';
import * as documentService from '../services/document.service.js';

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, status, search } = req.query as {
      category?: string;
      status?: string;
      search?: string;
    };

    const documents = await documentService.listDocuments({ category, status, search });
    const response: ApiResponse<typeof documents> = {
      success: true,
      data: documents,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const document = await documentService.getDocumentById(id);
    const response: ApiResponse<typeof document> = {
      success: true,
      data: document,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, content, category, status } = req.body;
    const created = await documentService.publishDocument(
      { title, content, category, status },
      req.user?.id
    );

    const response: ApiResponse<typeof created> = {
      success: true,
      data: created,
      message: 'Document created successfully.',
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { title, content, category, status } = req.body;

    const updated = await documentService.editDocument(id, {
      title,
      content,
      category,
      status,
    });

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
      message: 'Document updated successfully.',
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    await documentService.removeDocument(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Document deleted successfully.',
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
