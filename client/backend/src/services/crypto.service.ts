import { encrypt, decrypt, mask, isEncrypted, decryptJson } from '../utils/crypto.util.js';

/**
 * Encrypts arbitrary data (string or object) using AES-256-GCM.
 */
export const encryptPayload = (data: unknown): { encrypted: string } => {
  const encrypted = encrypt(data);
  return { encrypted };
};

/**
 * Decrypts an authenticated AES-256-GCM ciphertext string.
 */
export const decryptPayload = (ciphertext: string): { decrypted: unknown } => {
  const decrypted = decryptJson(ciphertext);
  return { decrypted };
};

export { encrypt, decrypt, mask, isEncrypted, decryptJson };
