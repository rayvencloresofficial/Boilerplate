import crypto from 'node:crypto';
import { ENV } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes (128 bits)
const AUTH_TAG_LENGTH = 16; // 16 bytes (128 bits)
export const ENCRYPTION_PREFIX = 'enc:v1:';

const DEFAULT_DEV_KEY = 'default-super-secret-encryption-key-32-bytes!';

/**
 * Derives a 32-byte cryptographic key Buffer.
 * Supports raw 64-character hexadecimal keys or derives via SHA-256 for strings.
 */
export function getKeyBuffer(explicitKey?: string): Buffer {
  const key = explicitKey || ENV.ENCRYPTION_KEY || DEFAULT_DEV_KEY;

  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }

  return crypto.createHash('sha256').update(key, 'utf8').digest();
}

/**
 * Checks whether a given string is in the versioned ciphertext format:
 * 'enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>'
 */
export function isEncrypted(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  if (!value.startsWith(ENCRYPTION_PREFIX)) return false;
  const parts = value.slice(ENCRYPTION_PREFIX.length).split(':');
  return parts.length === 3 && parts.every((part) => /^[0-9a-fA-F]+$/.test(part));
}

/**
 * Encrypts a string or JSON-serializable value using AES-256-GCM.
 * Produces an authenticated ciphertext string: 'enc:v1:<iv>:<tag>:<ciphertext>'
 */
export function encrypt(data: unknown, explicitKey?: string): string {
  if (data === null || data === undefined) {
    return '';
  }

  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const keyBuffer = getKeyBuffer(explicitKey);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let ciphertext = cipher.update(text, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${ENCRYPTION_PREFIX}${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

/**
 * Decrypts an authenticated AES-256-GCM ciphertext.
 * If the value is not encrypted, returns it unchanged.
 */
export function decrypt(ciphertext: string, explicitKey?: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') {
    return '';
  }

  if (!isEncrypted(ciphertext)) {
    return ciphertext;
  }

  const parts = ciphertext.slice(ENCRYPTION_PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format: expected 3 colon-separated segments.');
  }

  const [ivHex, tagHex, dataHex] = parts as [string, string, string];
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const keyBuffer = getKeyBuffer(explicitKey);

  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(dataHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Decrypts a ciphertext and attempts to parse it as JSON.
 * Falls back to returning the decrypted string if JSON parsing fails.
 */
export function decryptJson<T = unknown>(ciphertext: string, explicitKey?: string): T {
  const decrypted = decrypt(ciphertext, explicitKey);
  try {
    return JSON.parse(decrypted) as T;
  } catch {
    return decrypted as unknown as T;
  }
}

/**
 * Masks a sensitive string for safe display.
 */
export function mask(value: string, visibleStart = 2, visibleEnd = 4): string {
  if (!value || typeof value !== 'string') return '';
  if (value.length <= visibleStart + visibleEnd) {
    return '•'.repeat(value.length);
  }
  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  return `${start}${'•'.repeat(Math.min(8, Math.max(4, value.length - visibleStart - visibleEnd)))}${end}`;
}
