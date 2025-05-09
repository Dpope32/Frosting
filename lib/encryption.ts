import CryptoJS from 'crypto-js';
// Optionally import Sentry if available
let Sentry: any = null;
try {
  Sentry = require('@sentry/react-native');
} catch {}

/**
 * Encrypts a JSON-serializable object using AES with a deterministic IV derived from the key.
 * @param data    The object to encrypt.
 * @param keyHex  A hex string representing the 32-byte key.
 * @returns       Base64-encoded ciphertext.
 */
export const encryptSnapshot = (data: object, keyHex: string): string => {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv  = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32));
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key, { iv });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  } catch (err) {
    console.error('[encryption] Failed to encrypt snapshot:', err);
    if (Sentry && Sentry.captureException) Sentry.captureException(err);
    throw new Error('Failed to encrypt snapshot');
  }
};

/**
 * Decrypts Base64 ciphertext back into an object using AES with deterministic IV.
 * @param cipherBase64 Base64-encoded ciphertext.
 * @param keyHex       A hex string representing the 32-byte key.
 * @returns            The decrypted object.
 */
export const decryptSnapshot = (cipherBase64: string, keyHex: string): object => {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv  = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32));
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherBase64)
    });
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, { iv });
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (err) {
    console.error('[encryption] Failed to decrypt snapshot:', err);
    if (Sentry && Sentry.captureException) Sentry.captureException(err);
    throw new Error('Failed to decrypt snapshot');
  }
};