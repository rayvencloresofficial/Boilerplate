import { createContext } from 'react';
import type { User, DemoAccount } from '../types/auth';
import type { DemoAccountRole } from '../constants/demoCredentials';

export interface AuthContextType {
  user: User | null;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, pass: string) => Promise<void>;
  quickLogin: (roleOrEmail: DemoAccountRole | string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
  hasPermission: (...permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Re-export hook and constants for developer convenience and backwards compatibility
export { useAuth } from '../hooks/useAuth';
export { DEMO_CREDENTIALS, type DemoAccountRole } from '../constants/demoCredentials';
