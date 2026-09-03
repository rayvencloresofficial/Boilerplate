import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env.js';
import { UnauthorizedError } from '../../errors/AppError.js';
import type { AuthenticatedRequest, JwtPayload } from '../../types/auth.js';
import * as userRepository from '../../repositories/user.repository.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header missing or format invalid. Expected "Bearer <token>".');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Bearer token is empty.');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    } catch (jwtErr) {
      if (jwtErr instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Access token has expired. Please refresh your token.');
      }
      throw new UnauthorizedError('Invalid access token.');
    }

    const user = await userRepository.getUserWithRolesAndPermissions(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User account associated with this token was not found.');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('User account has been deactivated. Please contact an administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
