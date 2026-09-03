import { db } from '../config/database.js';

export const createRefreshToken = async (userId: string, tokenHash: string, expiresAt: Date) => {
  return await db
    .insertInto('refresh_tokens')
    .values({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
      revoked_at: null,
    })
    .returning(['id', 'user_id', 'token_hash', 'expires_at', 'revoked_at', 'created_at'])
    .executeTakeFirstOrThrow();
};

export const findByTokenHash = async (tokenHash: string) => {
  return await db
    .selectFrom('refresh_tokens')
    .selectAll()
    .where('token_hash', '=', tokenHash)
    .executeTakeFirst();
};

export const revokeToken = async (id: string) => {
  return await db
    .updateTable('refresh_tokens')
    .set({ revoked_at: new Date().toISOString() })
    .where('id', '=', id)
    .executeTakeFirst();
};

export const revokeAllUserTokens = async (userId: string) => {
  return await db
    .updateTable('refresh_tokens')
    .set({ revoked_at: new Date().toISOString() })
    .where('user_id', '=', userId)
    .where('revoked_at', 'is', null)
    .execute();
};
