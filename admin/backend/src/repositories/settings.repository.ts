import { sql } from 'kysely';
import { db } from '../config/database.js';

export interface SettingRecord {
  id: string;
  key: string;
  value: unknown;
  category: string;
  description: string | null;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSettingData {
  key: string;
  value: unknown;
  category?: string;
  description?: string | null;
  is_public?: boolean;
}

export interface UpdateSettingData {
  value?: unknown;
  category?: string;
  description?: string | null;
  is_public?: boolean;
}

export interface SettingsFilter {
  category?: string;
  is_public?: boolean;
}

/**
 * Lists all settings with optional filtering by category and public visibility.
 */
export const findAll = async (filter?: SettingsFilter): Promise<SettingRecord[]> => {
  let query = db.selectFrom('settings').selectAll();

  if (filter?.category) {
    query = query.where('category', '=', filter.category);
  }

  if (filter?.is_public !== undefined) {
    query = query.where('is_public', '=', filter.is_public);
  }

  const rows = await query
    .orderBy('category', 'asc')
    .orderBy('key', 'asc')
    .execute();

  return rows as SettingRecord[];
};

/**
 * Retrieves a single setting by its unique key.
 */
export const findByKey = async (key: string): Promise<SettingRecord | null> => {
  const row = await db
    .selectFrom('settings')
    .selectAll()
    .where('key', '=', key.trim())
    .executeTakeFirst();

  return (row as SettingRecord) || null;
};

/**
 * Creates a new setting with JSONB value.
 */
export const create = async (data: CreateSettingData): Promise<SettingRecord> => {
  const jsonString = JSON.stringify(data.value);

  const row = await db
    .insertInto('settings')
    .values({
      key: data.key.trim().toLowerCase(),
      value: sql`${jsonString}::jsonb`,
      category: data.category?.trim().toLowerCase() || 'general',
      description: data.description ?? null,
      is_public: data.is_public ?? false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return row as SettingRecord;
};

/**
 * Updates an existing setting by key.
 */
export const update = async (key: string, data: UpdateSettingData): Promise<SettingRecord | null> => {
  const updateValues: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.value !== undefined) {
    const jsonString = JSON.stringify(data.value);
    updateValues['value'] = sql`${jsonString}::jsonb`;
  }
  if (data.category !== undefined) {
    updateValues['category'] = data.category.trim().toLowerCase();
  }
  if (data.description !== undefined) {
    updateValues['description'] = data.description;
  }
  if (data.is_public !== undefined) {
    updateValues['is_public'] = data.is_public;
  }

  const row = await db
    .updateTable('settings')
    .set(updateValues)
    .where('key', '=', key.trim())
    .returningAll()
    .executeTakeFirst();

  return (row as SettingRecord) || null;
};

/**
 * Deletes a setting by its unique key.
 */
export const deleteByKey = async (key: string): Promise<boolean> => {
  const result = await db
    .deleteFrom('settings')
    .where('key', '=', key.trim())
    .executeTakeFirst();

  return Number(result.numDeletedRows) > 0;
};
