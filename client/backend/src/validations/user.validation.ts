import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100, 'Password cannot exceed 100 characters.'),
  first_name: z.string().trim().min(1, 'First name is required.').max(100),
  last_name: z.string().trim().min(1, 'Last name is required.').max(100),
  is_active: z.boolean().optional(),
  role_ids: z.array(z.string().uuid('Each role_id must be a valid UUID.')).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100, 'Password cannot exceed 100 characters.')
    .optional(),
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  role_ids: z.array(z.string().uuid('Each role_id must be a valid UUID.')).optional(),
});

export const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID.'),
});
