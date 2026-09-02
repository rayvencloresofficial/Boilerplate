import { api } from './api';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, User, TokenPair, DemoAccount } from '../types/auth';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
  return res.data!;
};

export const registerApi = async (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return res.data!;
};

export const refreshApi = async (refreshToken: string): Promise<TokenPair> => {
  const res = await api.post<ApiResponse<TokenPair>>('/auth/refresh', { refreshToken });
  return res.data!;
};

export const logoutApi = async (refreshToken?: string): Promise<void> => {
  await api.post('/auth/logout', { refreshToken });
};

export const getMeApi = async (): Promise<User> => {
  const res = await api.get<ApiResponse<User>>('/auth/me');
  return res.data!;
};

export const getDemoAccountsApi = async (): Promise<DemoAccount[]> => {
  const res = await api.get<ApiResponse<DemoAccount[]>>('/auth/demo-accounts');
  return res.data || [];
};

export const demoLoginApi = async (identifier: string): Promise<AuthResponse> => {
  const res = await api.post<ApiResponse<AuthResponse>>('/auth/demo-login', { email: identifier });
  return res.data!;
};

