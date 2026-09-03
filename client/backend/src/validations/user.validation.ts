import { z } from 'zod';

export const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1).max(100).optional(),
  last_name: z.string().trim().min(1).max(100).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('User ID must be a valid UUID.'),
});
