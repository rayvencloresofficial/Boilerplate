import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { UnauthorizedError, ForbiddenError, ConflictError, NotFoundError } from '../errors/AppError.js';
import * as userRepository from '../repositories/user.repository.js';
import * as roleRepository from '../repositories/role.repository.js';
import * as tokenRepository from '../repositories/token.repository.js';
import type {
  AuthUser,
  DemoAccountItem,
  JwtPayload,
  PortalType,
  RefreshTokenPayload,
  TokenPair,
} from '../types/auth.js';

const SALT_ROUNDS = 10;
const ADMIN_ROLES = ['super_admin', 'admin', 'manager'];
const REGULAR_USER_ROLE = 'user';

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const validatePortalAccess = (roles: string[], portal?: PortalType): void => {
  if (!portal) return;

  const hasAdminOrCustomRole = roles.some((role) => role !== REGULAR_USER_ROLE);
  const hasUserRole = roles.includes(REGULAR_USER_ROLE);

  if (portal === 'client') {
    // Client portal is for regular users only
    if (hasAdminOrCustomRole && !hasUserRole) {
      throw new ForbiddenError(
        'Access denied: The Client Portal is reserved for regular users. Administrative and custom role users must sign in via the Admin Portal.'
      );
    }
    if (!hasUserRole) {
      throw new ForbiddenError(
        'Access denied: You do not have permission to access the Client Portal.'
      );
    }
  } else if (portal === 'admin') {
    // Admin portal allows admin roles (super_admin, admin, manager) as well as any custom roles
    if (!hasAdminOrCustomRole) {
      throw new ForbiddenError(
        'Access denied: Administrative privileges required. Regular users must sign in via the Client Portal.'
      );
    }
  }
};

export const generateTokenPair = async (user: AuthUser, portal?: PortalType): Promise<TokenPair> => {
  const accessPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
    portal,
  };

  const accessToken = jwt.sign(accessPayload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const rawRefreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await tokenRepository.createRefreshToken(user.id, tokenHash, expiresAt);

  const refreshPayload: RefreshTokenPayload = {
    userId: user.id,
    tokenId: rawRefreshToken,
    portal,
  };

  const refreshToken = jwt.sign(refreshPayload, ENV.JWT_REFRESH_SECRET, {
    expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600,
  };
};

export const login = async (
  email: string,
  password: string,
  portal?: PortalType
): Promise<{ user: AuthUser; tokens: TokenPair }> => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  if (!user.is_active) {
    throw new UnauthorizedError('This account has been deactivated. Please contact support.');
  }

  const isMatch = await verifyPassword(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const fullUser = await userRepository.getUserWithRolesAndPermissions(user.id);
  if (!fullUser) {
    throw new NotFoundError('User profile details not found.');
  }

  validatePortalAccess(fullUser.roles, portal);

  const tokens = await generateTokenPair(fullUser, portal);
  return { user: fullUser, tokens };
};

export const register = async (userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}): Promise<{ user: AuthUser; tokens: TokenPair }> => {
  const existing = await userRepository.findByEmail(userData.email);
  if (existing) {
    throw new ConflictError('A user account with this email address already exists.');
  }

  // Find the default 'user' role for self-registration
  const defaultRole = await roleRepository.findByName(REGULAR_USER_ROLE);
  const roleIds = defaultRole ? [defaultRole.id] : [];

  const passwordHash = await hashPassword(userData.password);

  const createdUser = await userRepository.create(
    {
      email: userData.email,
      password_hash: passwordHash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_active: true,
    },
    roleIds
  );

  const fullUser = await userRepository.getUserWithRolesAndPermissions(createdUser.id);
  if (!fullUser) {
    throw new NotFoundError('User created but failed to hydrate.');
  }

  const tokens = await generateTokenPair(fullUser, 'client');
  return { user: fullUser, tokens };
};

export const refresh = async (refreshTokenStr: string): Promise<TokenPair> => {
  let decoded: RefreshTokenPayload;
  try {
    decoded = jwt.verify(refreshTokenStr, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    throw new UnauthorizedError('Refresh token is invalid or has expired.');
  }

  const tokenHash = hashToken(decoded.tokenId);
  const storedToken = await tokenRepository.findByTokenHash(tokenHash);

  if (!storedToken || storedToken.revoked_at || new Date(storedToken.expires_at) < new Date()) {
    throw new UnauthorizedError('Refresh token is revoked or expired.');
  }

  // Revoke old refresh token for rotation
  await tokenRepository.revokeToken(storedToken.id);

  const user = await userRepository.getUserWithRolesAndPermissions(decoded.userId);
  if (!user || !user.is_active) {
    throw new UnauthorizedError('User account is invalid or deactivated.');
  }

  validatePortalAccess(user.roles, decoded.portal);

  return await generateTokenPair(user, decoded.portal);
};

export const logout = async (refreshTokenStr?: string): Promise<void> => {
  if (!refreshTokenStr) return;
  try {
    const decoded = jwt.verify(refreshTokenStr, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    const tokenHash = hashToken(decoded.tokenId);
    const storedToken = await tokenRepository.findByTokenHash(tokenHash);
    if (storedToken) {
      await tokenRepository.revokeToken(storedToken.id);
    }
  } catch {
    // Silent fail on invalid logout tokens
  }
};

export const verifyToken = async (token: string, requiredPortal?: PortalType): Promise<AuthUser> => {
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Token is invalid or expired.');
  }

  const user = await userRepository.getUserWithRolesAndPermissions(decoded.userId);
  if (!user || !user.is_active) {
    throw new UnauthorizedError('User account is invalid or deactivated.');
  }

  if (requiredPortal) {
    validatePortalAccess(user.roles, requiredPortal);
  }

  return user;
};

const getRoleColor = (role?: string): string => {
  switch (role) {
    case 'super_admin':
      return 'danger';
    case 'admin':
      return 'primary';
    case 'manager':
      return 'warning';
    case 'user':
      return 'neutral';
    default:
      return 'success';
  }
};

const getRoleTitle = (roles: string[], firstName: string, lastName: string): string => {
  if (roles.includes('super_admin')) return 'Super Admin';
  if (roles.includes('admin')) return 'Administrator';
  if (roles.includes('manager')) return 'Manager';
  if (roles.includes('user')) return 'Standard User';
  if (roles.length > 0 && roles[0]) {
    const primary = roles[0];
    return primary
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return `${firstName} ${lastName}`.trim() || 'Staff User';
};

/**
 * Retrieves demo accounts tailored to the specified portal:
 * - 'admin': super_admin, admin, manager, and any custom staff accounts
 * - 'client': Only standard user accounts
 * - undefined: All accounts
 */
export const getDemoAccounts = async (portal?: PortalType): Promise<DemoAccountItem[]> => {
  const users = await userRepository.getAllUsersWithRolesAndPermissions();

  let filteredUsers = users;
  if (portal === 'client') {
    filteredUsers = users.filter(
      (u) => u.roles.includes(REGULAR_USER_ROLE) && !u.roles.some((r) => r !== REGULAR_USER_ROLE)
    );
  } else if (portal === 'admin') {
    filteredUsers = users.filter((u) => u.roles.some((r) => r !== REGULAR_USER_ROLE));
  }

  return filteredUsers.map((u) => ({
    id: u.id,
    email: u.email,
    first_name: u.first_name,
    last_name: u.last_name,
    is_active: u.is_active,
    roles: u.roles,
    permissions: u.permissions,
    title: getRoleTitle(u.roles, u.first_name, u.last_name),
    color: getRoleColor(u.roles[0]),
  }));
};

/**
 * Quick developer persona login with portal role validation.
 */
export const demoLogin = async (
  identifier: string,
  portal?: PortalType
): Promise<{ user: AuthUser; tokens: TokenPair }> => {
  let userId: string | null = null;
  let isActive = true;

  const byEmail = await userRepository.findByEmail(identifier);
  if (byEmail) {
    userId = byEmail.id;
    isActive = byEmail.is_active;
  } else {
    const byId = await userRepository.findById(identifier);
    if (byId) {
      userId = byId.id;
      isActive = byId.is_active;
    } else {
      const all = await userRepository.getAllUsersWithRolesAndPermissions();
      const match = all.find((u) => u.roles.includes(identifier));
      if (match) {
        userId = match.id;
        isActive = match.is_active;
      }
    }
  }

  if (!userId) {
    throw new NotFoundError(`User account matching '${identifier}' not found.`);
  }

  if (!isActive) {
    throw new UnauthorizedError('User account has been deactivated.');
  }

  const fullUser = await userRepository.getUserWithRolesAndPermissions(userId);
  if (!fullUser) {
    throw new NotFoundError('User profile details not found.');
  }

  validatePortalAccess(fullUser.roles, portal);

  const tokens = await generateTokenPair(fullUser, portal);
  return { user: fullUser, tokens };
};
