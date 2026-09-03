import type { Response, NextFunction } from 'express';
import * as roleService from '../services/role.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const getRoles = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await roleService.listRoles();

    const response: ApiResponse<typeof roles> = {
      success: true,
      data: roles,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const role = await roleService.getRoleById(id);

    const response: ApiResponse<typeof role> = {
      success: true,
      data: role,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, permission_ids } = req.body;
    const created = await roleService.createRole({ name, description }, permission_ids);

    const response: ApiResponse<typeof created> = {
      success: true,
      data: created,
      message: 'Role created successfully.',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { name, description, permission_ids } = req.body;

    const updated = await roleService.updateRole(id, { name, description }, permission_ids);

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
      message: 'Role updated successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    await roleService.deleteRole(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Role deleted successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
