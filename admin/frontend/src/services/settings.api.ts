import { api } from './api';
import type { ApiResponse } from '../types/api';

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSettingDto {
  value?: unknown;
  category?: string;
  description?: string | null;
  is_public?: boolean;
}

export interface CreateSettingDto {
  key: string;
  value: unknown;
  category?: string;
  description?: string | null;
  is_public?: boolean;
}

export interface SettingsFilterParams {
  category?: string;
  is_public?: boolean;
}

/**
 * Fetch all application settings (requires 'settings:read')
 */
export const getSettingsApi = async (filter?: SettingsFilterParams): Promise<Setting[]> => {
  const params = new URLSearchParams();
  if (filter?.category) params.append('category', filter.category);
  if (filter?.is_public !== undefined) params.append('is_public', String(filter.is_public));

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get<ApiResponse<Setting[]>>(`/settings${queryString}`);
  return res.data || [];
};

/**
 * Fetch public settings for initial bootstrap (unauthenticated)
 */
export const getPublicSettingsApi = async (): Promise<Setting[]> => {
  const res = await api.get<ApiResponse<Setting[]>>('/settings/public');
  return res.data || [];
};

/**
 * Fetch single setting by key
 */
export const getSettingByKeyApi = async (key: string): Promise<Setting> => {
  const res = await api.get<ApiResponse<Setting>>(`/settings/${encodeURIComponent(key)}`);
  return res.data!;
};

/**
 * Create custom setting (requires 'settings:manage')
 */
export const createSettingApi = async (data: CreateSettingDto): Promise<Setting> => {
  const res = await api.post<ApiResponse<Setting>>('/settings', data);
  return res.data!;
};

/**
 * Update existing setting by key (requires 'settings:manage')
 */
export const updateSettingApi = async (key: string, data: UpdateSettingDto): Promise<Setting> => {
  const res = await api.put<ApiResponse<Setting>>(`/settings/${encodeURIComponent(key)}`, data);
  return res.data!;
};

/**
 * Delete setting by key (requires 'settings:manage')
 */
export const deleteSettingApi = async (key: string): Promise<void> => {
  await api.delete(`/settings/${encodeURIComponent(key)}`);
};
