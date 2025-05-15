// src/sync/registrySyncManager.ts
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { storage } from '@/store/AsyncStorage';
import { encryptSnapshot } from '@/lib/encryption';
import * as Sentry from '@sentry/react-native';
import { useUserStore } from '@/store/UserStore';
import { addSyncLog } from '@/components/sync/syncUtils';
import { v4 as uuidv4 } from 'uuid';

const SYNC_KEY = 'registry_sync_key';

let syncKeyCache: string | null = null;
let syncKeyPromise: Promise<string> | null = null;

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
  // Return cached key if we have one
  if (syncKeyCache) {
    return syncKeyCache;
  }
  
  // If we're already generating a key, return the existing promise
  if (syncKeyPromise) {
    return syncKeyPromise;
  }
  
  // Create a new promise for generating the key
  syncKeyPromise = (async () => {
    try {
      addSyncLog('🔑 Generating sync key', 'verbose');
      let key: string;
      
      // Try to load existing device key
      try {
        key = await FileSystem.readAsStringAsync(
          `${FileSystem.documentDirectory}/device_id.txt`
        );
        addSyncLog('🔓 Loaded existing device key', 'verbose');
      } catch (e) {
        // Generate a new key if none exists
        key = uuidv4();
        addSyncLog('🆕 Generated new device key', 'verbose');
        
        // Save to persistent storage
        await FileSystem.writeAsStringAsync(
          `${FileSystem.documentDirectory}/device_id.txt`,
          key
        );
      }
      
      // Cache the result
      syncKeyCache = key;
      return key;
    } catch (error) {
      addSyncLog('⚠️ Error generating sync key', 'error', 
        error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      // Clear the promise reference when done
      syncKeyPromise = null;
    }
  })();
  
  return syncKeyPromise;
};

/**
 * Exports the entire registry snapshot, encrypts it, and writes to a file.
 * @param allStates The states from all stores to encrypt and export
 * @returns URI of the encrypted file.
 */
export const exportEncryptedState = async (allStates: Record<string, any>): Promise<string> => {
  const isPremium = useUserStore.getState().preferences.premium === true;
  if (!isPremium) return '';
  addSyncLog('Exporting encrypted state', 'info');
  Sentry.addBreadcrumb({
    category: 'sync',
    message: 'exportEncryptedState called',
    level: 'info',
  });
  try {
    const key = await generateSyncKey();
    const cipher = encryptSnapshot(allStates, key);
    const uri = `${FileSystem.documentDirectory}stateSnapshot.enc`;
    await FileSystem.writeAsStringAsync(uri, cipher, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    Sentry.addBreadcrumb({
      category: 'sync',
      message: 'Encrypted state exported',
      data: { uri },
      level: 'info',
    });
    return uri;
  } catch (err) {
    Sentry.captureException(err);
    Sentry.addBreadcrumb({
      category: 'sync',
      message: 'Error in exportEncryptedState',
      data: { error: err },
      level: 'error',
    });
    addSyncLog('Error in exportEncryptedState', 'error');
    throw err;
  }
};
