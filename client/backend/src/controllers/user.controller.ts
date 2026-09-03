import type { Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated.' });
      return;
    }
    const user = await userService.getUserById(userId);
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthenticated.' });
      return;
    }
    const { first_name, last_name } = req.body;
    const updated = await userService.updateProfile(userId, { first_name, last_name });
    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
      message: 'Profile updated successfully.',
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    if (req.user?.id !== id) {
      res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile.' });
      return;
    }
    const user = await userService.getUserById(id);
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
