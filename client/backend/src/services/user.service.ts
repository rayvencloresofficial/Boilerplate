import { NotFoundError } from '../errors/AppError.js';
import * as userRepository from '../repositories/user.repository.js';
import type { UserSummary } from '../repositories/user.repository.js';

export const getUserById = async (id: string): Promise<UserSummary> => {
  const user = await userRepository.getUserWithRolesAndPermissions(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    is_active: user.is_active,
    roles: user.roles,
    created_at: new Date(),
    updated_at: new Date(),
  };
};

export const updateProfile = async (
  userId: string,
  data: { first_name?: string; last_name?: string }
): Promise<UserSummary> => {
  const updated = await userRepository.update(userId, {
    first_name: data.first_name,
    last_name: data.last_name,
  });
  if (!updated) {
    throw new NotFoundError('User', userId);
  }
  return updated;
};
