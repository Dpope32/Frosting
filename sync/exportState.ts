// src/sync/exportState.ts
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import { encryptSnapshot } from '@/lib/encryption';
import * as Sentry from '@sentry/react-native';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getCurrentWorkspaceId } from './getWorkspace';
import { getWorkspaceKey } from './workspaceKey';
import { generateSyncKey } from './registrySyncManager';
import { Platform } from 'react-native';

const WEB_SNAPSHOT_KEY = 'encrypted_state_snapshot';

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
      //addSyncLog(`🔑 Using key hash ${key.slice(0,6)}…${key.slice(-6)}`, 'verbose');
      const cipher = encryptSnapshot(allStates, key);
      const sha = CryptoJS.SHA256(cipher).toString().slice(0,8);
      //addSyncLog(`📦 Snapshot SHA ${sha}`, 'verbose');
      
      // Web compatibility: use localStorage instead of FileSystem
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(WEB_SNAPSHOT_KEY, cipher);
        }
        const uri = `web://localStorage/${WEB_SNAPSHOT_KEY}`;
        Sentry.addBreadcrumb({
          category: 'sync',
          message: 'Encrypted state exported to localStorage',
          data: { uri },
          level: 'info',
        });
        return uri;
      } else {
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
      }
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