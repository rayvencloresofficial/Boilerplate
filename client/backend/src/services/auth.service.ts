import { ENV } from '../config/env.js';
import { AppError, UnauthorizedError, ForbiddenError, ConflictError, NotFoundError } from '../errors/AppError.js';
import type { AuthUser, DemoAccountItem, TokenPair } from '../types/auth.js';

const callAuthService = async <T>(endpoint: string, method: string, body?: unknown): Promise<T> => {
  const baseUrl = ENV.AUTH_SERVICE_URL.endsWith('/auth')
    ? ENV.AUTH_SERVICE_URL
    : `${ENV.AUTH_SERVICE_URL}/auth`;

  try {
    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as { success?: boolean; data?: T; message?: string };
    if (!res.ok) {
      if (res.status === 401) throw new UnauthorizedError(json.message || 'Invalid credentials.');
      if (res.status === 403) throw new ForbiddenError(json.message || 'Forbidden.');
      if (res.status === 404) throw new NotFoundError(json.message || 'Not found.');
      if (res.status === 409) throw new ConflictError(json.message || 'Conflict.');
      throw new AppError(json.message || 'Auth service error.', res.status);
    }
    return json.data as T;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      'Authentication service is temporarily unavailable. Please try again shortly.',
      503
    );
  }
};

export const login = async (
  email: string,
  password: string
): Promise<{ user: AuthUser; tokens: TokenPair }> => {
  return await callAuthService<{ user: AuthUser; tokens: TokenPair }>('/login', 'POST', {
    email,
    password,
    portal: 'client',
  });
};

export const register = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<{ user: AuthUser; tokens: TokenPair }> => {
  return await callAuthService<{ user: AuthUser; tokens: TokenPair }>('/register', 'POST', userData);
};

export const refresh = async (refreshTokenStr: string): Promise<TokenPair> => {
  return await callAuthService<TokenPair>('/refresh', 'POST', { refreshToken: refreshTokenStr });
};

export const logout = async (refreshTokenStr?: string): Promise<void> => {
  if (!refreshTokenStr) return;
  await callAuthService<null>('/logout', 'POST', { refreshToken: refreshTokenStr });
};

export const getDemoAccounts = async (): Promise<DemoAccountItem[]> => {
  return await callAuthService<DemoAccountItem[]>('/demo-accounts?portal=client', 'GET');
};

export const demoLogin = async (identifier: string): Promise<{ user: AuthUser; tokens: TokenPair }> => {
  return await callAuthService<{ user: AuthUser; tokens: TokenPair }>('/demo-login', 'POST', {
    email: identifier,
    portal: 'client',
  });
};
