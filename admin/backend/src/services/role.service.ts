import { ConflictError, ForbiddenError, NotFoundError } from '../errors/AppError.js';
import * as roleRepository from '../repositories/role.repository.js';
import type { RoleDetail } from '../repositories/role.repository.js';

export const listRoles = async (): Promise<RoleDetail[]> => {
  return await roleRepository.findAll();
};

export const getRoleById = async (id: string): Promise<RoleDetail> => {
  const role = await roleRepository.findById(id);
  if (!role) {
    throw new NotFoundError('Role', id);
  }
  return role;
};

export const createRole = async (
  roleData: { name: string; description?: string | null },
  permissionIds: string[] = []
): Promise<RoleDetail> => {
  const existing = await roleRepository.findByName(roleData.name);
  if (existing) {
    throw new ConflictError(`Role with name '${roleData.name}' already exists.`);
  }

  return await roleRepository.create(
    {
      name: roleData.name,
      description: roleData.description,
      is_system: false,
    },
    permissionIds
  );
};

export const updateRole = async (
  id: string,
  roleData: { name?: string; description?: string | null },
  permissionIds?: string[]
): Promise<RoleDetail> => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Role', id);
  }

  if (roleData.name && roleData.name.toLowerCase() !== existing.name.toLowerCase()) {
    if (existing.is_system) {
      throw new ForbiddenError(`Protected system role '${existing.name}' cannot be renamed.`);
    }
    const nameConflict = await roleRepository.findByName(roleData.name);
    if (nameConflict && nameConflict.id !== id) {
      throw new ConflictError(`Role name '${roleData.name}' is already in use.`);
    }
  }

  const updated = await roleRepository.update(id, roleData, permissionIds);
  if (!updated) {
    throw new NotFoundError('Role', id);
  }

  return updated;
};

export const deleteRole = async (id: string): Promise<void> => {
  const existing = await roleRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Role', id);
  }

  if (existing.is_system) {
    throw new ForbiddenError(`Protected system role '${existing.name}' cannot be deleted.`);
  }

  const deleted = await roleRepository.deleteRole(id);
  if (!deleted) {
    throw new NotFoundError('Role', id);
  }
};
