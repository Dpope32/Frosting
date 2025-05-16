// src/sync/registrySyncManager.ts
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { storage } from '@/store/AsyncStorage';
import { encryptSnapshot } from '@/lib/encryption';
import * as Sentry from '@sentry/react-native';
import { useUserStore } from '@/store';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getCurrentWorkspaceId } from './workspace';
import { getWorkspaceKey } from './workspaceKey';
import { getPocketBase } from './pocketSync';

const WS_KEY_PREFIX = 'ws_key_'; 
const SYNC_KEY = 'registry_sync_key';

/**
 * Generates a pseudo-random 32-byte key using pure JavaScript.
 * This function completely avoids native crypto modules to ensure cross-platform compatibility.
 */
export const generateRandomKey = (): string => {
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
  // key can exist for free users; premium just gates network sync
  addSyncLog('🔐 Generating sync key for device', 'info');
  
  try {
    const wid = await getCurrentWorkspaceId().catch(() => null);
    if (wid) {
      addSyncLog(`🔍 Checking for workspace key for: ${wid}`, 'info');
      const keyPath = `${WS_KEY_PREFIX}${wid}`;
      const shared = await storage.getString(keyPath);
      
      if (shared) {
        addSyncLog(`🔑 Found workspace key: ${shared.slice(0,6)}...${shared.slice(-6)}`, 'info');
        return shared;  // ←<<<< use workspace key
      } else {
        addSyncLog(`⚠️ No workspace key found at ${keyPath}`, 'warning');
      }
    }
    
    addSyncLog('🔍 Checking for device sync key', 'info');
    let key = await storage.getString(SYNC_KEY);
    if (!key) {
      addSyncLog('⚠️ No sync key found, generating new random key', 'warning');
      key = generateRandomKey();
      await storage.set(SYNC_KEY, key);
      addSyncLog(`🔑 Generated new key: ${key.slice(0,6)}...${key.slice(-6)}`, 'info');
    } else {
      addSyncLog(`🔑 Using existing device key: ${key.slice(0,6)}...${key.slice(-6)}`, 'info');
    }
    return key;
  } catch (err) {
    addSyncLog('❌ Error in generateSyncKey', 'error', 
      err instanceof Error ? err.message : String(err));
    Sentry.captureException(err);
    throw err;
  }
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
    
    // This call is already correct (no parameter passed)
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

// Add this new function to explicitly check and log the key comparison
export const checkKeySync = async (workspaceId: string): Promise<boolean> => {
  addSyncLog(`🧪 Checking key synchronization for workspace: ${workspaceId}`, 'info');
  
  try {
    // Get the workspace shared key
    const wsKeyPath = `${WS_KEY_PREFIX}${workspaceId}`;
    const wsKey = await storage.getString(wsKeyPath);
    
    if (!wsKey) {
      addSyncLog('❌ No workspace key found locally', 'error');
      return false;
    }
    
    // Get the actual workspace record to compare shared_key
    const pb = await getPocketBase();
    const workspace = await pb.collection('sync_workspaces').getOne(workspaceId);
    
    const remoteKey = workspace.shared_key;
    
    addSyncLog(`🔑 Local key: ${wsKey.slice(0,6)}...${wsKey.slice(-6)}`, 'info');
    addSyncLog(`🔑 Remote key: ${remoteKey.slice(0,6)}...${remoteKey.slice(-6)}`, 'info');
    
    const keysMatch = wsKey === remoteKey;
    addSyncLog(keysMatch ? '✅ Keys match!' : '❌ Keys mismatch!', keysMatch ? 'success' : 'error');
    
    if (!keysMatch) {
      // Update local key to match remote
      addSyncLog('🔄 Updating local key to match remote', 'info');
      await storage.set(wsKeyPath, remoteKey);
    }
    
    return keysMatch;
  } catch (err) {
    addSyncLog('❌ Error checking key sync', 'error', 
      err instanceof Error ? err.message : String(err));
    return false;
  }
};
