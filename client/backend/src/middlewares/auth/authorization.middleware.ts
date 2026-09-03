import type { Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../errors/AppError.js';
import type { AuthenticatedRequest } from '../../types/auth.js';

/**
 * Role-based guard middleware.
 * Grants access if user possesses at least one of the specified roles.
 * 'super_admin' role grants universal master access.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication is required prior to role verification.'));
    }

    const userRoles = req.user.roles;

    // Super Admin master bypass
    if (userRoles.includes('super_admin')) {
      return next();
    }

    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return next(
        new ForbiddenError(
          `Access Denied: Requires at least one of role(s) [${allowedRoles.join(', ')}].`,
          {
            required: allowedRoles,
            actual: userRoles,
          }
        )
      );
    }

    next();
  };
};

/**
 * Fine-grained permission-based guard middleware.
 * Grants access if user possesses all specified permissions.
 * 'super_admin' role grants universal master access.
 */
export const requirePermission = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication is required prior to permission verification.'));
    }

    // Super Admin master bypass
    if (req.user.roles.includes('super_admin')) {
      return next();
    }

    const userPermissions = new Set(req.user.permissions);
    const missingPermissions = requiredPermissions.filter((perm) => !userPermissions.has(perm));

    if (missingPermissions.length > 0) {
      return next(
        new ForbiddenError(
          `Access Denied: Missing required permission(s) [${missingPermissions.join(', ')}].`,
          {
            required: requiredPermissions,
            actual: req.user.permissions,
          }
        )
      );
    }

    next();
  };
};
