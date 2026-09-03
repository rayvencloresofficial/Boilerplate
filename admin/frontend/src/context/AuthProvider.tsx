import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';
import type { User, DemoAccount } from '../types/auth';
import { loginApi, logoutApi, getMeApi, getDemoAccountsApi, demoLoginApi } from '../services/auth.api';
import { AuthContext } from './AuthContext';
import { DEMO_CREDENTIALS, type DemoAccountRole } from '../constants/demoCredentials';

const DEFAULT_DEMO_ACCOUNTS: DemoAccount[] = (
  Object.keys(DEMO_CREDENTIALS) as DemoAccountRole[]
).map((roleKey) => ({
  id: roleKey,
  email: DEMO_CREDENTIALS[roleKey].email,
  first_name: DEMO_CREDENTIALS[roleKey].title.split(' ')[0] || '',
  last_name: DEMO_CREDENTIALS[roleKey].title.split(' ')[1] || '',
  is_active: true,
  roles: [roleKey],
  permissions: [],
  title: DEMO_CREDENTIALS[roleKey].title,
  color: DEMO_CREDENTIALS[roleKey].color,
}));

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(localStorage.getItem('access_token')));
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>(DEFAULT_DEMO_ACCOUNTS);

  const fetchDemoAccounts = useCallback(async () => {
    try {
      const accounts = await getDemoAccountsApi();
      if (accounts && accounts.length > 0) {
        setDemoAccounts(accounts);
      }
    } catch {
      // Gracefully retain default fallback accounts
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getMeApi();
      setUser(currentUser);
      fetchDemoAccounts();
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchDemoAccounts]);

  useEffect(() => {
    let isMounted = true;

    getDemoAccountsApi()
      .then((accounts) => {
        if (isMounted && accounts && accounts.length > 0) {
          setDemoAccounts(accounts);
        }
      })
      .catch(() => {});

    const token = localStorage.getItem('access_token');
    if (!token) {
      return;
    }

    getMeApi()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchDemoAccounts]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, tokens } = await loginApi(email, pass);
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      setUser(loggedInUser);
      fetchDemoAccounts();
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (roleOrEmail: DemoAccountRole | string) => {
    setIsLoading(true);
    try {
      // 1. Attempt live demo-login directly against database
      const res = await demoLoginApi(roleOrEmail);
      localStorage.setItem('access_token', res.tokens.accessToken);
      localStorage.setItem('refresh_token', res.tokens.refreshToken);
      setUser(res.user);
      fetchDemoAccounts();
    } catch {
      // 2. Fallback to password-based login
      let email = roleOrEmail;
      if (roleOrEmail in DEMO_CREDENTIALS) {
        email = DEMO_CREDENTIALS[roleOrEmail as DemoAccountRole].email;
      } else {
        const found = demoAccounts.find(
          (a) => a.roles.includes(roleOrEmail) || a.email === roleOrEmail
        );
        if (found) email = found.email;
      }
      await login(email, 'Password123!');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  };

  const roles = useMemo(() => user?.roles || [], [user?.roles]);
  const permissions = useMemo(() => user?.permissions || [], [user?.permissions]);

  const hasRole = useCallback(
    (...targetRoles: string[]): boolean => {
      if (!user) return false;
      if (roles.includes('super_admin')) return true; // Master bypass
      return targetRoles.some((r) => roles.includes(r));
    },
    [user, roles]
  );

  const hasPermission = useCallback(
    (...targetPermissions: string[]): boolean => {
      if (!user) return false;
      if (roles.includes('super_admin')) return true; // Master bypass
      const permSet = new Set(permissions);
      return targetPermissions.some((p) => permSet.has(p));
    },
    [user, roles, permissions]
  );

  const hasAllPermissions = useCallback(
    (targetPermissions: string[]): boolean => {
      if (!user) return false;
      if (roles.includes('super_admin')) return true;
      const permSet = new Set(permissions);
      return targetPermissions.every((p) => permSet.has(p));
    },
    [user, roles, permissions]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        demoAccounts,
        login,
        quickLogin,
        logout,
        refreshUser,
        hasRole,
        hasPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
