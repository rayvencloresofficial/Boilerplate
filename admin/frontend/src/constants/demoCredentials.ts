export type DemoAccountRole = 'super_admin' | 'admin' | 'manager' | 'user' | string;

export interface DemoCredentialItem {
  email: string;
  pass: string;
  title: string;
  color: string;
}

export const DEMO_CREDENTIALS: Record<string, DemoCredentialItem> = {
  super_admin: {
    email: 'superadmin@example.com',
    pass: 'Password123!',
    title: 'Super Admin',
    color: 'danger',
  },
  admin: {
    email: 'admin@example.com',
    pass: 'Password123!',
    title: 'Administrator',
    color: 'primary',
  },
  manager: {
    email: 'manager@example.com',
    pass: 'Password123!',
    title: 'Manager',
    color: 'warning',
  },
  user: {
    email: 'user@example.com',
    pass: 'Password123!',
    title: 'Standard User',
    color: 'neutral',
  },
};
