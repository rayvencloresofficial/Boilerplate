import { db } from '../config/database.js';

export interface PermissionDetail {
  id: string;
  slug: string;
  module: string;
  description: string | null;
  created_at: Date;
}

/**
 * Returns all available system permissions ordered by module and slug.
 */
export const findAll = async (): Promise<PermissionDetail[]> => {
  return await db
    .selectFrom('permissions')
    .selectAll()
    .orderBy('module', 'asc')
    .orderBy('slug', 'asc')
    .execute();
};

/**
 * Retrieves permissions belonging to a specific module.
 */
export const findByModule = async (module: string): Promise<PermissionDetail[]> => {
  return await db
    .selectFrom('permissions')
    .selectAll()
    .where('module', '=', module)
    .orderBy('slug', 'asc')
    .execute();
};

/**
 * Retrieves permissions by an array of IDs.
 */
export const findByIds = async (ids: string[]): Promise<PermissionDetail[]> => {
  if (ids.length === 0) return [];
  return await db
    .selectFrom('permissions')
    .selectAll()
    .where('id', 'in', ids)
    .execute();
};
