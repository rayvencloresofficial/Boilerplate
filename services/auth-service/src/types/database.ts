import type { ColumnType, Generated } from 'kysely';

export interface UserTable {
  id: Generated<string>;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: Generated<boolean>;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface RoleTable {
  id: Generated<string>;
  name: string;
  description: string | null;
  is_system: Generated<boolean>;
  created_at: ColumnType<Date, string | undefined, never>;
  updated_at: ColumnType<Date, string | undefined, string>;
}

export interface PermissionTable {
  id: Generated<string>;
  slug: string;
  module: string;
  description: string | null;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface UserRoleTable {
  user_id: string;
  role_id: string;
  assigned_at: ColumnType<Date, string | undefined, never>;
}

export interface RolePermissionTable {
  role_id: string;
  permission_id: string;
  assigned_at: ColumnType<Date, string | undefined, never>;
}

export interface RefreshTokenTable {
  id: Generated<string>;
  user_id: string;
  token_hash: string;
  expires_at: ColumnType<Date, string | Date, never>;
  revoked_at: ColumnType<Date | null, string | Date | null, string | Date | null>;
  created_at: ColumnType<Date, string | undefined, never>;
}

export interface Database {
  users: UserTable;
  roles: RoleTable;
  permissions: PermissionTable;
  user_roles: UserRoleTable;
  role_permissions: RolePermissionTable;
  refresh_tokens: RefreshTokenTable;
}
