import { api, ApiHttpError } from './api';
import type { ApiResponse } from '../types/api';
import type { User, Role, Permission, ProblemDetails } from '../types/auth';

export interface RbacTestResult {
  success: boolean;
  status: number;
  latencyMs: number;
  data: unknown;
  problem?: ProblemDetails;
}

export const getUsersApi = async (): Promise<User[]> => {
  const res = await api.get<ApiResponse<User[]>>('/users');
  return res.data || [];
};

export const createUserApi = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_ids?: string[];
}): Promise<User> => {
  const res = await api.post<ApiResponse<User>>('/users', userData);
  return res.data!;
};

export const updateUserApi = async (
  id: string,
  userData: {
    email?: string;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    role_ids?: string[];
  }
): Promise<User> => {
  const res = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
  return res.data!;
};

export const deleteUserApi = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const getRolesApi = async (): Promise<Role[]> => {
  const res = await api.get<ApiResponse<Role[]>>('/roles');
  return res.data || [];
};

export const createRoleApi = async (roleData: {
  name: string;
  description?: string;
  permission_ids?: string[];
}): Promise<Role> => {
  const res = await api.post<ApiResponse<Role>>('/roles', roleData);
  return res.data!;
};

export const updateRoleApi = async (
  id: string,
  roleData: {
    name?: string;
    description?: string;
    permission_ids?: string[];
  }
): Promise<Role> => {
  const res = await api.put<ApiResponse<Role>>(`/roles/${id}`, roleData);
  return res.data!;
};

export const deleteRoleApi = async (id: string): Promise<void> => {
  await api.delete(`/roles/${id}`);
};

export const getPermissionsApi = async (): Promise<Permission[]> => {
  const res = await api.get<ApiResponse<Permission[]>>('/permissions');
  return res.data || [];
};

/**
 * Fires a test call to a backend RBAC test endpoint and captures real latency and response/problem details.
 */
export const testRbacEndpoint = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' | 'PUT' = 'GET',
  data?: unknown
): Promise<RbacTestResult> => {
  const startTime = performance.now();
  try {
    let res: ApiResponse<unknown>;
    if (method === 'GET') {
      res = await api.get<ApiResponse<unknown>>(`/test-rbac${endpoint}`);
    } else if (method === 'POST') {
      res = await api.post<ApiResponse<unknown>>(`/test-rbac${endpoint}`, data);
    } else if (method === 'DELETE') {
      res = await api.delete<ApiResponse<unknown>>(`/test-rbac${endpoint}`);
    } else {
      res = await api.put<ApiResponse<unknown>>(`/test-rbac${endpoint}`, data);
    }
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      status: 200,
      latencyMs,
      data: res.data,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    if (err instanceof ApiHttpError) {
      return {
        success: false,
        status: err.problem.status,
        latencyMs,
        data: err.problem,
        problem: err.problem,
      };
    }
    return {
      success: false,
      status: 500,
      latencyMs,
      data: { error: 'Unknown network or parsing error' },
    };
  }
};
