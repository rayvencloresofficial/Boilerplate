import type { Response, NextFunction } from 'express';
import * as permissionService from '../services/permission.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const getPermissions = async (
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const permissions = await permissionService.listPermissions();

    const response: ApiResponse<typeof permissions> = {
      success: true,
      data: permissions,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
