import type { Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Login successful.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'User registered successfully.',
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};  

export const refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const tokenPair = await authService.refresh(refreshToken);

    const response: ApiResponse<typeof tokenPair> = {
      success: true,
      data: tokenPair,
      message: 'Token refreshed successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Logged out successfully.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const response: ApiResponse<typeof req.user> = {
      success: true,
      data: req.user,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDemoAccounts = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accounts = await authService.getDemoAccounts();
    const response: ApiResponse<typeof accounts> = {
      success: true,
      data: accounts,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role, userId } = req.body;
    const identifier = email || userId || role;
    if (!identifier) {
      res.status(400).json({ success: false, message: 'An email, role, or userId must be specified for demo login.' });
      return;
    }

    const result = await authService.demoLogin(identifier);
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Demo login successful.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

