export type DemoAccountRole = 'super_admin' | 'admin' | 'manager' | 'user';

export interface DemoCredentialItem {
  email: string;
  pass: string;
  title: string;
  color: string;
}

export const DEMO_CREDENTIALS: Record<string, DemoCredentialItem> = {
  user: {
    email: 'user@example.com',
    pass: 'Password123!',
    title: 'Standard User (Elena Rostova)',
    color: 'neutral',
  },
};
