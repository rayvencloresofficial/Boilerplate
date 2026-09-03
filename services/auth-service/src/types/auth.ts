import type { Request } from 'express';

export type PortalType = 'admin' | 'client';

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface DemoAccountItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  title: string;
  color: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  roles: string[];
  portal?: PortalType;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  portal?: PortalType;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
