// ===============================================
// File: lib/encryption.ts
// Purpose: Typed AES encrypt/decrypt helpers for Registry snapshots.
// ===============================================

import CryptoJS from 'crypto-js';
let Sentry: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Sentry = require('@sentry/react-native');
} catch {}

/**
 * Encrypts a JSON‑serialisable object using AES with a deterministic IV
 * (first 16 bytes of the key).
 */
export const encryptSnapshot = (
  data: string,
  keyHex: string,
): string => {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32));
    // Remove JSON.stringify since data is already a string
    const encrypted = CryptoJS.AES.encrypt(data, key, { iv });
    return encrypted.toString();
  } catch (err) {
    console.error('[encryption] Failed to encrypt snapshot:', err);
    if (Sentry?.captureException) Sentry.captureException(err);
    throw new Error('Failed to encrypt snapshot');
  }
};

/**
 * Decrypts previously encrypted snapshot back into its original object.
 */
export const decryptSnapshot = (
  cipherText: string,
  keyHex: string,
): string => { // Return string, not object
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32));
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, { iv });
    // Return the string directly, don't JSON.parse
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error('[encryption] Failed to decrypt snapshot:', err);
    if (Sentry?.captureException) Sentry.captureException(err);
    throw new Error('Failed to decrypt snapshot');
  }
};

