import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiResponse } from '../types/api.js';

export const testSuperAdminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: 'Access Granted: Super Admin root operation permitted.',
      data: {
        operation: 'system:root:access',
        authenticatedAs: req.user?.email,
        roles: req.user?.roles,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testAdminArea = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: 'Access Granted: Administrative console reached.',
      data: {
        operation: 'admin:console:access',
        authenticatedAs: req.user?.email,
        roles: req.user?.roles,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testUserCreate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: Fine-grained permission 'users:create' confirmed.",
      data: {
        permissionChecked: 'users:create',
        authenticatedAs: req.user?.email,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testUserDelete = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: Critical permission 'users:delete' confirmed.",
      data: {
        permissionChecked: 'users:delete',
        authenticatedAs: req.user?.email,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testRolesManage = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: Role assignment permission 'roles:manage' confirmed.",
      data: {
        permissionChecked: 'roles:manage',
        authenticatedAs: req.user?.email,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testAnalyticsRead = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: Telemetry permission 'analytics:read' confirmed.",
      data: {
        permissionChecked: 'analytics:read',
        authenticatedAs: req.user?.email,
        metrics: {
          activeSessions: 42,
          rbacDecisionsPerMinute: 128,
          health: 'Optimal',
        },
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testSettingsManage = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: System mutation permission 'settings:manage' confirmed.",
      data: {
        permissionChecked: 'settings:manage',
        authenticatedAs: req.user?.email,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testDocumentsRead = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: Example module permission 'documents:read' confirmed.",
      data: {
        module: 'documents',
        permissionChecked: 'documents:read',
        authenticatedAs: req.user?.email,
        documents: [
          { id: 'doc-001', title: 'Q3 Financial Audit.pdf', classification: 'Internal' },
          { id: 'doc-002', title: 'Security Compliance Specification.pdf', classification: 'Restricted' },
        ],
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const testDocumentsCreate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const response: ApiResponse<unknown> = {
      success: true,
      message: "Access Granted: Example module permission 'documents:create' confirmed.",
      data: {
        module: 'documents',
        permissionChecked: 'documents:create',
        authenticatedAs: req.user?.email,
        operation: 'Document drafted and staged in repository',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};
