import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name must be at least 2 characters.')
    .max(50, 'Role name cannot exceed 50 characters.')
    .regex(/^[a-z0-9_]+$/, 'Role name must be lowercase alphanumeric with underscores only (e.g. support_lead).'),
  description: z.string().trim().max(255).optional().nullable(),
  permission_ids: z.array(z.string().uuid('Each permission_id must be a valid UUID.')).optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_]+$/)
    .optional(),
  description: z.string().trim().max(255).optional().nullable(),
  permission_ids: z.array(z.string().uuid('Each permission_id must be a valid UUID.')).optional(),
});

export const roleIdParamSchema = z.object({
  id: z.string().uuid('Role ID must be a valid UUID.'),
});
