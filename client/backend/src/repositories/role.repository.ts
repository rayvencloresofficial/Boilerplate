import { sql, type Transaction } from 'kysely';
import { db } from '../config/database.js';
import type { Database } from '../types/database.js';

export interface CreateRoleData {
  name: string;
  description?: string | null;
  is_system?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  description?: string | null;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Returns all roles along with their assigned permission slugs.
 */
export const findAll = async (): Promise<RoleDetail[]> => {
  const rows = await db
    .selectFrom('roles')
    .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
    .leftJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
    .groupBy(['roles.id', 'roles.name', 'roles.description', 'roles.is_system', 'roles.created_at', 'roles.updated_at'])
    .select([
      'roles.id',
      'roles.name',
      'roles.description',
      'roles.is_system',
      'roles.created_at',
      'roles.updated_at',
      sql<string[]>`COALESCE(array_agg(DISTINCT permissions.slug) FILTER (WHERE permissions.slug IS NOT NULL), '{}')`.as('permissions'),
    ])
    .orderBy('roles.name', 'asc')
    .execute();

  return rows.map((row) => ({
    ...row,
    permissions: row.permissions || [],
  }));
};

/**
 * Retrieves a role by ID with permissions.
 */
export const findById = async (id: string): Promise<RoleDetail | null> => {
  const row = await db
    .selectFrom('roles')
    .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
    .leftJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('roles.id', '=', id)
    .groupBy(['roles.id', 'roles.name', 'roles.description', 'roles.is_system', 'roles.created_at', 'roles.updated_at'])
    .select([
      'roles.id',
      'roles.name',
      'roles.description',
      'roles.is_system',
      'roles.created_at',
      'roles.updated_at',
      sql<string[]>`COALESCE(array_agg(DISTINCT permissions.slug) FILTER (WHERE permissions.slug IS NOT NULL), '{}')`.as('permissions'),
    ])
    .executeTakeFirst();

  if (!row) return null;

  return {
    ...row,
    permissions: row.permissions || [],
  };
};

/**
 * Retrieves a role by name.
 */
export const findByName = async (name: string) => {
  return await db
    .selectFrom('roles')
    .selectAll()
    .where(sql`LOWER(name)`, '=', name.toLowerCase().trim())
    .executeTakeFirst();
};

/**
 * Creates a new role and maps permissions within an atomic transaction.
 */
export const create = async (
  roleData: CreateRoleData,
  permissionIds: string[] = [],
  externalTrx?: Transaction<Database>
): Promise<RoleDetail> => {
  const runner = async (trx: Transaction<Database>) => {
    const insertedRole = await trx
      .insertInto('roles')
      .values({
        name: roleData.name.trim().toLowerCase(),
        description: roleData.description ?? null,
        is_system: roleData.is_system ?? false,
      })
      .returning(['id', 'name', 'description', 'is_system', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    const uniquePermissionIds = [...new Set(permissionIds)];
    if (uniquePermissionIds.length > 0) {
      const values = uniquePermissionIds.map((pId) => ({
        role_id: insertedRole.id,
        permission_id: pId,
      }));
      await trx.insertInto('role_permissions').values(values).execute();
    }

    const permissions = uniquePermissionIds.length > 0
      ? await trx
          .selectFrom('permissions')
          .select('slug')
          .where('id', 'in', uniquePermissionIds)
          .execute()
      : [];

    return {
      ...insertedRole,
      permissions: permissions.map((p) => p.slug),
    };
  };

  return externalTrx ? await runner(externalTrx) : await db.transaction().execute(runner);
};

/**
 * Updates a role and synchronizes permission mappings atomically.
 */
export const update = async (
  id: string,
  roleData: UpdateRoleData,
  permissionIds?: string[],
  externalTrx?: Transaction<Database>
): Promise<RoleDetail | null> => {
  const runner = async (trx: Transaction<Database>) => {
    const updateValues: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (roleData.name !== undefined) updateValues['name'] = roleData.name.trim().toLowerCase();
    if (roleData.description !== undefined) updateValues['description'] = roleData.description;

    const updatedRole = await trx
      .updateTable('roles')
      .set(updateValues)
      .where('id', '=', id)
      .returning(['id', 'name', 'description', 'is_system', 'created_at', 'updated_at'])
      .executeTakeFirst();

    if (!updatedRole) return null;

    if (permissionIds !== undefined) {
      const uniquePermissionIds = [...new Set(permissionIds)];
      // Re-sync permissions
      await trx.deleteFrom('role_permissions').where('role_id', '=', id).execute();

      if (uniquePermissionIds.length > 0) {
        const values = uniquePermissionIds.map((pId) => ({
          role_id: id,
          permission_id: pId,
        }));
        await trx.insertInto('role_permissions').values(values).execute();
      }
    }

    const permsResult = await trx
      .selectFrom('role_permissions')
      .innerJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
      .select('permissions.slug')
      .where('role_permissions.role_id', '=', id)
      .execute();

    return {
      ...updatedRole,
      permissions: permsResult.map((p) => p.slug),
    };
  };

  return externalTrx ? await runner(externalTrx) : await db.transaction().execute(runner);
};

/**
 * Deletes a role if it is not a protected system role.
 */
export const deleteRole = async (id: string): Promise<boolean> => {
  const result = await db
    .deleteFrom('roles')
    .where('id', '=', id)
    .where('is_system', '=', false)
    .executeTakeFirst();

  return Number(result.numDeletedRows) > 0;
};
