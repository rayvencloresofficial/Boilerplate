import bcrypt from 'bcryptjs';
import { ConflictError, NotFoundError } from '../errors/AppError.js';
import { encrypt, decrypt } from '../utils/crypto.util.js';
import * as userRepository from '../repositories/user.repository.js';
import type { UserSummary } from '../repositories/user.repository.js';

const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

const sanitizeUserSummary = (user: UserSummary): UserSummary => ({
  ...user,
  phone_number: user.phone_number ? decrypt(user.phone_number) : null,
});

export const listUsers = async (limit = 50, offset = 0): Promise<UserSummary[]> => {
  const users = await userRepository.findAll(limit, offset);
  return users.map(sanitizeUserSummary);
};

export const getUserById = async (id: string): Promise<UserSummary> => {
  const user = await userRepository.getUserWithRolesAndPermissions(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return sanitizeUserSummary({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_active: user.is_active,
    phone_number: user.phone_number,
    roles: user.roles,
    created_at: new Date(),
    updated_at: new Date(),
  });
};

export const updateProfile = async (
  userId: string,
  data: { first_name?: string; last_name?: string; phone_number?: string | null }
): Promise<UserSummary> => {
  const updateData: userRepository.UpdateUserData = {
    first_name: data.first_name,
    last_name: data.last_name,
  };

  if (data.phone_number !== undefined) {
    updateData.phone_number = data.phone_number ? encrypt(data.phone_number) : null;
  }

  const updated = await userRepository.update(userId, updateData);
  if (!updated) {
    throw new NotFoundError('User', userId);
  }
  return sanitizeUserSummary(updated);
};

export const createUser = async (
  userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    is_active?: boolean;
    phone_number?: string | null;
  },
  roleIds: string[] = []
): Promise<UserSummary> => {
  const existing = await userRepository.findByEmail(userData.email);
  if (existing) {
    throw new ConflictError(`User with email '${userData.email}' already exists.`);
  }

  const passwordHash = await hashPassword(userData.password);
  const encryptedPhone = userData.phone_number ? encrypt(userData.phone_number) : null;

  const created = await userRepository.create(
    {
      email: userData.email,
      password_hash: passwordHash,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_active: userData.is_active ?? true,
      phone_number: encryptedPhone,
    },
    roleIds
  );

  return sanitizeUserSummary(created);
};

export const updateUser = async (
  id: string,
  userData: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
    is_active?: boolean;
    phone_number?: string | null;
  },
  roleIds?: string[]
): Promise<UserSummary> => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('User', id);
  }

  if (userData.email && userData.email.toLowerCase() !== existing.email.toLowerCase()) {
    const emailConflict = await userRepository.findByEmail(userData.email);
    if (emailConflict && emailConflict.id !== id) {
      throw new ConflictError(`Email '${userData.email}' is already taken by another user.`);
    }
  }

  const updateData: userRepository.UpdateUserData = {
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    is_active: userData.is_active,
  };

  if (userData.password) {
    updateData.password_hash = await hashPassword(userData.password);
  }

  if (userData.phone_number !== undefined) {
    updateData.phone_number = userData.phone_number ? encrypt(userData.phone_number) : null;
  }

  const updated = await userRepository.update(id, updateData, roleIds);
  if (!updated) {
    throw new NotFoundError('User', id);
  }

  return sanitizeUserSummary(updated);
};

export const deleteUser = async (id: string): Promise<void> => {
  const existing = await userRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('User', id);
  }

  const deleted = await userRepository.deleteUser(id);
  if (!deleted) {
    throw new NotFoundError('User', id);
  }
};
