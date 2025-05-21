// src/sync/registrySyncManager.ts
import { addSyncLog } from '@/components/sync/syncUtils';
import { generateRandomKey } from './randomKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useUserStore } from '@/store';
import * as Sentry from '@sentry/react-native';
import { getCurrentWorkspaceId } from './getWorkspace';
import { getWorkspaceKey } from './workspaceKey';
import { encryptSnapshot } from '@/lib/encryption';
import * as FileSystem from 'expo-file-system';
import CryptoJS from 'crypto-js';

/**
 * Retrieves or generates a unique DEVICE-SPECIFIC sync key stored in AsyncStorage.
 * This key is used for device-level identification or encryption when not in a workspace context.
 * IT SHOULD NOT RETURN THE WORKSPACE KEY.
 * Throws an error if premium is not enabled.
 */
export const generateSyncKey = async (): Promise<string> => {
  // Check if premium is enabled
  if (!useUserStore.getState().preferences.premium) {
    addSyncLog('Premium sync is not enabled. Cannot generate/retrieve device-specific sync key.', 'error');
    throw new Error('Premium sync is not enabled. Cannot generate/retrieve device-specific sync key.');
  }

  // Check for stored unique device ID first
  const deviceIdKey = 'app_unique_device_id';
  const storedDeviceId = await AsyncStorage.getItem(deviceIdKey);
  
  if (storedDeviceId) {
    return storedDeviceId;
  }
  
  // If no stored ID (fallback), create a new one using your existing generateRandomKey function
  const deviceInfo = Platform.OS + '-' + Platform.Version;
  const timestamp = Date.now().toString(36);
  const randomKey = generateRandomKey(); // Use your existing function
  const newDeviceId = `${deviceInfo}-${timestamp}-${randomKey.substring(0, 12)}`.replace(/\s+/g, '-');
  
  // Store for future use
  await AsyncStorage.setItem(deviceIdKey, newDeviceId);
  
  return newDeviceId;
};


/**
 * Exports the entire registry snapshot, encrypts it, and writes to a file.
 * @param allStates The states from all stores to encrypt and export
 * @returns URI of the encrypted file.
 */
export const exportEncryptedState = async (allStates: Record<string, any>): Promise<string> => {
  addSyncLog('Exporting encrypted state', 'info');
  Sentry.addBreadcrumb({
    category: 'sync',
    message: 'exportEncryptedState called',
    level: 'info',
  });
  try {
    const wsId = await getCurrentWorkspaceId();
    
    // Use the correct key source
    const key = wsId ? await getWorkspaceKey() : await generateSyncKey();
    if (!key) {
      addSyncLog('Failed to generate or retrieve encryption key', 'error');
      throw new Error('Failed to generate or retrieve encryption key');
    }
    addSyncLog(`🔑 Using key hash ${key.slice(0,6)}…${key.slice(-6)}`, 'verbose');
    const cipher = encryptSnapshot(allStates, key);
    const sha = CryptoJS.SHA256(cipher).toString().slice(0,8);
    addSyncLog(`📦 Snapshot SHA ${sha}`, 'verbose');
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