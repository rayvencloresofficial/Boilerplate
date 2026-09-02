export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface DemoAccount {
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

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  slug: string;
  module: string;
  description: string | null;
  created_at: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
