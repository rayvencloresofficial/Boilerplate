import type { Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = req.query['limit'] ? parseInt(String(req.query['limit']), 10) : 50;
    const offset = req.query['offset'] ? parseInt(String(req.query['offset']), 10) : 0;

    const users = await userService.listUsers(limit, offset);

    const response: ApiResponse<typeof users> = {
      success: true,
      data: users,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

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
    const { first_name, last_name, phone_number } = req.body;
    const updated = await userService.updateProfile(userId, { first_name, last_name, phone_number });
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

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, first_name, last_name, is_active, phone_number, role_ids } = req.body;
    const created = await userService.createUser(
      { email, password, first_name, last_name, is_active, phone_number },
      role_ids
    );

    const response: ApiResponse<typeof created> = {
      success: true,
      data: created,
      message: 'User created successfully.',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { email, password, first_name, last_name, is_active, phone_number, role_ids } = req.body;

    const updated = await userService.updateUser(
      id,
      { email, password, first_name, last_name, is_active, phone_number },
      role_ids
    );

    const response: ApiResponse<typeof updated> = {
      success: true,
      data: updated,
      message: 'User updated successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    await userService.deleteUser(id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'User deleted successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
