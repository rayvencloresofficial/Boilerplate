import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import type { AuthenticatedRequest, PortalType } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, portal } = req.body;
    const result = await authService.login(email, password, portal as PortalType | undefined);

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

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, portal } = req.body;
    const user = await authService.verifyToken(token, portal as PortalType | undefined);

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      message: 'Token is valid.',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDemoAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const portal = req.query.portal as PortalType | undefined;
    const accounts = await authService.getDemoAccounts(portal);

    const response: ApiResponse<typeof accounts> = {
      success: true,
      data: accounts,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, role, userId, portal } = req.body;
    const identifier = email || userId || role;
    if (!identifier) {
      res.status(400).json({
        success: false,
        message: 'An email, role, or userId must be specified for demo login.',
      });
      return;
    }

    const result = await authService.demoLogin(identifier, portal as PortalType | undefined);
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
