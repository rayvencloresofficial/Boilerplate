import * as settingsRepo from '../repositories/settings.repository.js';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { encrypt, decryptJson, isEncrypted } from '../utils/crypto.util.js';
import type {
  SettingRecord,
  CreateSettingData,
  UpdateSettingData,
  SettingsFilter,
} from '../repositories/settings.repository.js';

/**
 * Returns all settings matching optional filter criteria.
 * Masks encrypted values for security in overview listings.
 */
export const listSettings = async (filter?: SettingsFilter): Promise<SettingRecord[]> => {
  const rows = await settingsRepo.findAll(filter);
  return rows.map((setting) => {
    if (setting.is_encrypted) {
      return {
        ...setting,
        value: '••••••••',
      };
    }
    return setting;
  });
};

/**
 * Returns all publicly available settings for client initialization.
 * Automatically excludes encrypted/secret settings.
 */
export const listPublicSettings = async (): Promise<SettingRecord[]> => {
  return await settingsRepo.findAll({ is_public: true, is_encrypted: false });
};

/**
 * Retrieves a single setting by key, throwing 404 if not found.
 * Decrypts the value if it is marked as encrypted.
 */
export const getSettingByKey = async (key: string): Promise<SettingRecord> => {
  const setting = await settingsRepo.findByKey(key);
  if (!setting) {
    throw new NotFoundError('Setting', key);
  }

  if (setting.is_encrypted) {
    const rawVal = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
    const decryptedValue = isEncrypted(rawVal) ? decryptJson(rawVal) : setting.value;
    return {
      ...setting,
      value: decryptedValue,
    };
  }

  return setting;
};

/**
 * Creates a new setting entry, encrypting the value if marked or categorized as secrets.
 */
export const createSetting = async (data: CreateSettingData): Promise<SettingRecord> => {
  const existing = await settingsRepo.findByKey(data.key);
  if (existing) {
    throw new ConflictError(`Setting with key '${data.key}' already exists.`);
  }

  const shouldEncrypt = Boolean(data.is_encrypted || data.category === 'secrets');
  const storedValue = shouldEncrypt ? encrypt(data.value) : data.value;

  const created = await settingsRepo.create({
    ...data,
    value: storedValue,
    is_encrypted: shouldEncrypt,
    is_public: shouldEncrypt ? false : (data.is_public ?? false),
  });

  return {
    ...created,
    value: shouldEncrypt ? data.value : created.value,
  };
};

/**
 * Updates an existing setting by key, maintaining or applying encryption.
 */
export const updateSetting = async (
  key: string,
  data: UpdateSettingData,
): Promise<SettingRecord> => {
  const existing = await settingsRepo.findByKey(key);
  if (!existing) {
    throw new NotFoundError('Setting', key);
  }

  const willBeEncrypted = data.is_encrypted !== undefined
    ? data.is_encrypted
    : Boolean(existing.is_encrypted || data.category === 'secrets');

  let storedValue = data.value;
  if (data.value !== undefined) {
    storedValue = willBeEncrypted ? encrypt(data.value) : data.value;
  }

  const updated = await settingsRepo.update(key, {
    ...data,
    value: storedValue,
    is_encrypted: willBeEncrypted,
    is_public: willBeEncrypted ? false : data.is_public,
  });

  if (!updated) {
    throw new NotFoundError('Setting', key);
  }

  return {
    ...updated,
    value: willBeEncrypted && data.value !== undefined ? data.value : updated.value,
  };
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
