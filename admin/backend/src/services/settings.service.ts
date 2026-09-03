import * as settingsRepo from '../repositories/settings.repository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import type {
  SettingRecord,
  CreateSettingData,
  UpdateSettingData,
  SettingsFilter,
} from '../repositories/settings.repository.js';

/**
 * Returns all settings matching optional filter criteria.
 */
export const listSettings = async (filter?: SettingsFilter): Promise<SettingRecord[]> => {
  return await settingsRepo.findAll(filter);
};

/**
 * Returns all publicly available settings for client initialization.
 */
export const listPublicSettings = async (): Promise<SettingRecord[]> => {
  return await settingsRepo.findAll({ is_public: true });
};

/**
 * Retrieves a single setting by key, throwing 404 if not found.
 */
export const getSettingByKey = async (key: string): Promise<SettingRecord> => {
  const setting = await settingsRepo.findByKey(key);
  if (!setting) {
    throw new NotFoundError('Setting', key);
  }
  return setting;
};

/**
 * Creates a new setting entry, rejecting duplicates with 409 Conflict.
 */
export const createSetting = async (data: CreateSettingData): Promise<SettingRecord> => {
  const existing = await settingsRepo.findByKey(data.key);
  if (existing) {
    throw new ConflictError(`Setting with key '${data.key}' already exists.`);
  }

  return await settingsRepo.create(data);
};

/**
 * Updates an existing setting by key.
 */
export const updateSetting = async (
  key: string,
  data: UpdateSettingData,
): Promise<SettingRecord> => {
  const existing = await settingsRepo.findByKey(key);
  if (!existing) {
    throw new NotFoundError('Setting', key);
  }

  const updated = await settingsRepo.update(key, data);
  if (!updated) {
    throw new NotFoundError('Setting', key);
  }

  return updated;
};

/**
 * Deletes a setting by key.
 */
export const deleteSetting = async (key: string): Promise<void> => {
  const existing = await settingsRepo.findByKey(key);
  if (!existing) {
    throw new NotFoundError('Setting', key);
  }

  await settingsRepo.deleteByKey(key);
};
