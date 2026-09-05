import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address.').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  portal: z.enum(['admin', 'client']).optional(),
});

export const registerSchema = z.object({
  email: z.string().email('Please provide a valid email address.').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one numeric digit.'),
  first_name: z.string().min(1, 'First name is required.').max(100).trim(),
  last_name: z.string().min(1, 'Last name is required.').max(100).trim(),
  phone_number: z.string().trim().max(50).optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required.'),
});

export const demoLoginSchema = z.object({
  email: z.string().optional(),
  userId: z.string().optional(),
  role: z.string().optional(),
  portal: z.enum(['admin', 'client']).optional(),
});

export const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required.'),
  portal: z.enum(['admin', 'client']).optional(),
});
