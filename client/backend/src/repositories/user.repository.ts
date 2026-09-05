import { sql, type Transaction } from 'kysely';
import { db } from '../config/database.js';
import type { Database } from '../types/database.js';
import type { AuthUser } from '../types/auth.js';

export interface CreateUserData {
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active?: boolean;
  phone_number?: string | null;
}

export interface UpdateUserData {
  email?: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  phone_number?: string | null;
}

export interface UserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  phone_number?: string | null;
  roles: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Retrieves a user by ID along with their aggregated roles and distinct permissions.
 */
export const getUserWithRolesAndPermissions = async (userId: string): Promise<AuthUser | null> => {
  const result = await db
    .selectFrom('users')
    .leftJoin('user_roles', 'user_roles.user_id', 'users.id')
    .leftJoin('roles', 'roles.id', 'user_roles.role_id')
    .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
    .leftJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('users.id', '=', userId)
    .groupBy(['users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.is_active', 'users.phone_number'])
    .select([
      'users.id',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.is_active',
      'users.phone_number',
      sql<string[]>`COALESCE(array_agg(DISTINCT roles.name) FILTER (WHERE roles.name IS NOT NULL), '{}')`.as('roles'),
      sql<string[]>`COALESCE(array_agg(DISTINCT permissions.slug) FILTER (WHERE permissions.slug IS NOT NULL), '{}')`.as('permissions'),
    ])
    .executeTakeFirst();

  if (!result) return null;

  return {
    id: result.id,
    email: result.email,
    first_name: result.first_name,
    last_name: result.last_name,
    is_active: result.is_active,
    phone_number: result.phone_number,
    roles: result.roles || [],
    permissions: result.permissions || [],
  };
};

/**
 * Retrieves all active users along with their aggregated roles and distinct permissions.
 */
export const getAllUsersWithRolesAndPermissions = async (): Promise<AuthUser[]> => {
  const rows = await db
    .selectFrom('users')
    .leftJoin('user_roles', 'user_roles.user_id', 'users.id')
    .leftJoin('roles', 'roles.id', 'user_roles.role_id')
    .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
    .leftJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('users.is_active', '=', true)
    .groupBy(['users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.is_active', 'users.phone_number', 'users.created_at'])
    .select([
      'users.id',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.is_active',
      'users.phone_number',
      sql<string[]>`COALESCE(array_agg(DISTINCT roles.name) FILTER (WHERE roles.name IS NOT NULL), '{}')`.as('roles'),
      sql<string[]>`COALESCE(array_agg(DISTINCT permissions.slug) FILTER (WHERE permissions.slug IS NOT NULL), '{}')`.as('permissions'),
    ])
    .orderBy('users.created_at', 'asc')
    .execute();

  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    first_name: r.first_name,
    last_name: r.last_name,
    is_active: r.is_active,
    phone_number: r.phone_number,
    roles: r.roles || [],
    permissions: r.permissions || [],
  }));
};

/**
 * Finds user by email (case-insensitive) including password for authentication.
 */
export const findByEmail = async (email: string) => {
  return await db
    .selectFrom('users')
    .selectAll()
    .where(sql`LOWER(email)`, '=', email.toLowerCase().trim())
    .executeTakeFirst();
};

/**
 * Finds user by ID without password hash.
 */
export const findById = async (id: string) => {
  return await db
    .selectFrom('users')
    .select(['id', 'email', 'first_name', 'last_name', 'is_active', 'phone_number', 'created_at', 'updated_at'])
    .where('id', '=', id)
    .executeTakeFirst();
};

/**
 * Lists all users with their assigned roles.
 */
export const findAll = async (limit = 50, offset = 0): Promise<UserSummary[]> => {
  const rows = await db
    .selectFrom('users')
    .leftJoin('user_roles', 'user_roles.user_id', 'users.id')
    .leftJoin('roles', 'roles.id', 'user_roles.role_id')
    .groupBy(['users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.is_active', 'users.phone_number', 'users.created_at', 'users.updated_at'])
    .select([
      'users.id',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.is_active',
      'users.phone_number',
      'users.created_at',
      'users.updated_at',
      sql<string[]>`COALESCE(array_agg(DISTINCT roles.name) FILTER (WHERE roles.name IS NOT NULL), '{}')`.as('roles'),
    ])
    .orderBy('users.created_at', 'desc')
    .limit(limit)
    .offset(offset)
    .execute();

  return rows.map((row) => ({
    ...row,
    roles: row.roles || [],
  }));
};

/**
 * Creates a new user and assigns roles in a transaction.
 */
export const create = async (
  userData: CreateUserData,
  roleIds: string[] = [],
  externalTrx?: Transaction<Database>
): Promise<UserSummary> => {
  const runner = async (trx: Transaction<Database>) => {
    const insertedUser = await trx
      .insertInto('users')
      .values({
        email: userData.email.toLowerCase().trim(),
        password_hash: userData.password_hash,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        is_active: userData.is_active ?? true,
        phone_number: userData.phone_number ?? null,
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'is_active', 'phone_number', 'created_at', 'updated_at'])
      .executeTakeFirstOrThrow();

    if (roleIds.length > 0) {
      const userRolesValues = roleIds.map((roleId) => ({
        user_id: insertedUser.id,
        role_id: roleId,
      }));
      await trx.insertInto('user_roles').values(userRolesValues).execute();
    }

    const assignedRoles = roleIds.length > 0
      ? await trx
          .selectFrom('roles')
          .select('name')
          .where('id', 'in', roleIds)
          .execute()
      : [];

    return {
      ...insertedUser,
      roles: assignedRoles.map((r) => r.name),
    };
  };

  return externalTrx ? await runner(externalTrx) : await db.transaction().execute(runner);
};

/**
 * Updates a user and optionally reassigns their roles within an atomic transaction.
 */
export const update = async (
  id: string,
  userData: UpdateUserData,
  roleIds?: string[],
  externalTrx?: Transaction<Database>
): Promise<UserSummary | null> => {
  const runner = async (trx: Transaction<Database>) => {
    const updateValues: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (userData.email !== undefined) updateValues['email'] = userData.email.toLowerCase().trim();
    if (userData.password_hash !== undefined) updateValues['password_hash'] = userData.password_hash;
    if (userData.first_name !== undefined) updateValues['first_name'] = userData.first_name.trim();
    if (userData.last_name !== undefined) updateValues['last_name'] = userData.last_name.trim();
    if (userData.is_active !== undefined) updateValues['is_active'] = userData.is_active;
    if (userData.phone_number !== undefined) updateValues['phone_number'] = userData.phone_number;

    const updatedUser = await trx
      .updateTable('users')
      .set(updateValues)
      .where('id', '=', id)
      .returning(['id', 'email', 'first_name', 'last_name', 'is_active', 'phone_number', 'created_at', 'updated_at'])
      .executeTakeFirst();

    if (!updatedUser) return null;

    if (roleIds !== undefined) {
      // Synchronize roles atomically
      await trx.deleteFrom('user_roles').where('user_id', '=', id).execute();

      if (roleIds.length > 0) {
        const userRolesValues = roleIds.map((roleId) => ({
          user_id: id,
          role_id: roleId,
        }));
        await trx.insertInto('user_roles').values(userRolesValues).execute();
      }
    }

    const rolesResult = await trx
      .selectFrom('user_roles')
      .innerJoin('roles', 'roles.id', 'user_roles.role_id')
      .select('roles.name')
      .where('user_roles.user_id', '=', id)
      .execute();

    return {
      ...updatedUser,
      roles: rolesResult.map((r) => r.name),
    };
  };

  return externalTrx ? await runner(externalTrx) : await db.transaction().execute(runner);
};

/**
 * Deletes a user by ID (cascades to user_roles and refresh_tokens).
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await db.deleteFrom('users').where('id', '=', id).executeTakeFirst();
  return Number(result.numDeletedRows) > 0;
};
