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
 * (first 16 bytes of the key).
 */
export const encryptSnapshot = (
  data: Record<string, unknown>,
  keyHex: string,
): string => {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32));
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  } catch (err) {
    console.error('[encryption] Failed to encrypt snapshot:', err);
    if (Sentry?.captureException) Sentry.captureException(err);
    throw new Error('Failed to encrypt snapshot');
  }
};

/**
 * Decrypts previously encrypted snapshot back into its original object.
 */
export const decryptSnapshot = <T extends Record<string, unknown>>(
  cipherBase64: string,
  keyHex: string,
): T => {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32));
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherBase64),
    });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
  } catch (err) {
    console.error('[encryption] Failed to decrypt snapshot:', err);
    if (Sentry?.captureException) Sentry.captureException(err);
    throw new Error('Failed to decrypt snapshot');
  }
};

