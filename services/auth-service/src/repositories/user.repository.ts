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
}

export interface UserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  roles: string[];
}

export const getUserWithRolesAndPermissions = async (userId: string): Promise<AuthUser | null> => {
  const result = await db
    .selectFrom('users')
    .leftJoin('user_roles', 'user_roles.user_id', 'users.id')
    .leftJoin('roles', 'roles.id', 'user_roles.role_id')
    .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
    .leftJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('users.id', '=', userId)
    .groupBy(['users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.is_active'])
    .select([
      'users.id',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.is_active',
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
    roles: result.roles || [],
    permissions: result.permissions || [],
  };
};

export const getAllUsersWithRolesAndPermissions = async (): Promise<AuthUser[]> => {
  const rows = await db
    .selectFrom('users')
    .leftJoin('user_roles', 'user_roles.user_id', 'users.id')
    .leftJoin('roles', 'roles.id', 'user_roles.role_id')
    .leftJoin('role_permissions', 'role_permissions.role_id', 'roles.id')
    .leftJoin('permissions', 'permissions.id', 'role_permissions.permission_id')
    .where('users.is_active', '=', true)
    .groupBy(['users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.is_active', 'users.created_at'])
    .select([
      'users.id',
      'users.email',
      'users.first_name',
      'users.last_name',
      'users.is_active',
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
    roles: r.roles || [],
    permissions: r.permissions || [],
  }));
};

export const findByEmail = async (email: string) => {
  return await db
    .selectFrom('users')
    .selectAll()
    .where(sql`LOWER(email)`, '=', email.toLowerCase().trim())
    .executeTakeFirst();
};

export const findById = async (id: string) => {
  return await db
    .selectFrom('users')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
};

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
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'is_active'])
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
