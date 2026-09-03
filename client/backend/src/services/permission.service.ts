import * as permissionRepository from '../repositories/permission.repository.js';
import type { PermissionDetail } from '../repositories/permission.repository.js';

export const listPermissions = async (): Promise<PermissionDetail[]> => {
  return await permissionRepository.findAll();
};

export const listByModule = async (module: string): Promise<PermissionDetail[]> => {
  return await permissionRepository.findByModule(module);
};
