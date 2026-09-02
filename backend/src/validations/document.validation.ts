import { z } from 'zod';

export const createDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(255, 'Title cannot exceed 255 characters.'),
  content: z.string().trim().optional().nullable(),
  category: z
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters.')
    .max(100, 'Category cannot exceed 100 characters.')
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const updateDocumentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(255, 'Title cannot exceed 255 characters.')
    .optional(),
  content: z.string().trim().optional().nullable(),
  category: z
    .string()
    .trim()
    .min(2, 'Category must be at least 2 characters.')
    .max(100, 'Category cannot exceed 100 characters.')
    .optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid document ID format.'),
});

export const documentFilterQuerySchema = z.object({
  category: z.string().trim().optional(),
  status: z.string().trim().optional(),
  search: z.string().trim().optional(),
});
