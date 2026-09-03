import { z } from 'zod';

export const createSettingSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'Setting key must be at least 2 characters.')
    .max(100, 'Setting key cannot exceed 100 characters.')
    .regex(
      /^[a-z0-9_.-]+$/,
      'Setting key must be lowercase alphanumeric with dots, underscores, or hyphens (e.g. app.name).',
    ),
  value: z
    .unknown()
    .refine((val) => val !== undefined, { message: 'Setting value is required.' }),
  category: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_-]+$/, 'Category must be lowercase alphanumeric.')
    .optional(),
  description: z.string().trim().max(500).optional().nullable(),
  is_public: z.boolean().optional(),
});

export const updateSettingSchema = z.object({
  value: z.unknown().optional(),
  category: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_-]+$/)
    .optional(),
  description: z.string().trim().max(500).optional().nullable(),
  is_public: z.boolean().optional(),
});

export const settingKeyParamSchema = z.object({
  key: z.string().trim().min(1, 'Setting key is required.').max(100),
});

export const settingsFilterQuerySchema = z.object({
  category: z.string().trim().optional(),
  is_public: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});
