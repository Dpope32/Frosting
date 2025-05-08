// src/sync/registrySyncManager.ts
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { storage } from '@/store/AsyncStorage';
import { encryptSnapshot } from '@/lib/encryption';

const SYNC_KEY = 'registry_sync_key';

/**
 * Generates a pseudo-random 32-byte key using pure JavaScript.
 * This function completely avoids native crypto modules to ensure cross-platform compatibility.
 */
const generateRandomKey = (): string => {
  // Create a hex string directly without relying on WordArray.create which might use native crypto
  let hexString = '';
  const characters = '0123456789abcdef';
  
  // Generate 64 hex characters (32 bytes)
  for (let i = 0; i < 64; i++) {
    hexString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return hexString;
};

/**
 * Retrieves or generates a unique sync key stored in AsyncStorage.
 */
export const generateSyncKey = async (): Promise<string> => {
  let key = await storage.getString(SYNC_KEY);
  if (!key) {
    key = generateRandomKey();
    await storage.set(SYNC_KEY, key);
  }
  return key;
};

/**
 * Exports the entire registry snapshot, encrypts it, and writes to a file.
 * @param allStates The states from all stores to encrypt and export
 * @returns URI of the encrypted file.
 */
export const exportEncryptedState = async (allStates: Record<string, any>): Promise<string> => {
  const key = await generateSyncKey();
  const cipher = encryptSnapshot(allStates, key);
  const uri = `${FileSystem.documentDirectory}stateSnapshot.enc`;
  await FileSystem.writeAsStringAsync(uri, cipher, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return uri;
};
