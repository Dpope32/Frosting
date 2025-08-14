// src/sync/registrySyncManager.ts
import { addSyncLog } from '@/components/sync/syncUtils';
import { generateRandomKey } from './randomKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { getCurrentWorkspaceId } from './getWorkspace';
import { getWorkspaceKey } from './workspaceKey';
import { encryptSnapshot } from '@/lib/encryption';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';

const WEB_SNAPSHOT_KEY = 'encrypted_state_snapshot';

/**
 * Retrieves or generates a unique DEVICE-SPECIFIC sync key stored in AsyncStorage.
 * This key is used for device-level identification or encryption when not in a workspace context.
 * IT SHOULD NOT RETURN THE WORKSPACE KEY.
 * Throws an error if premium is not enabled.
 */
export const generateSyncKey = async (): Promise<string> => {

  // Check for stored unique device ID first
  const deviceIdKey = 'app_unique_device_id';
  const storedDeviceId = await AsyncStorage.getItem(deviceIdKey);
  
  if (storedDeviceId) {
    return storedDeviceId;
  }
  
  // If no stored ID (fallback), create a new one using your existing generateRandomKey function
  // Fix Platform.Version for web compatibility
  const platformVersion = Platform.OS === 'web' ? 'browser' : Platform.Version;
  const deviceInfo = Platform.OS + '-' + platformVersion;
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

  // 🔧 FIXED: Better completion analysis that handles both patterns correctly
  if (allStates.tasks?.tasks) {
    const tasks = Object.values(allStates.tasks.tasks) as any[];
    const today = format(new Date(), 'yyyy-MM-dd'); // CORRECT - Uses local timezone like toggleTaskCompletion
    

      // 🚨 DEBUG: Show what dates DO have completion data
      const tasksWithAnyCompletion = tasks.filter(task => 
        task.completionHistory && Object.keys(task.completionHistory).length > 0
      );
      if (tasksWithAnyCompletion.length > 0) {
        const allCompletionDates = new Set();
        tasksWithAnyCompletion.forEach(task => {
          Object.keys(task.completionHistory || {}).forEach(date => allCompletionDates.add(date));
        });
       // addSyncLog(
       //   `[EXPORT DEBUG] Found completion history for dates: ${Array.from(allCompletionDates).sort().join(', ')}`,
       //   'warning',
       //   `🚨 But NO completion data for today (${today}). Tasks with completion history: ${tasksWithAnyCompletion.length}. Check date format consistency!`
       // );
      }



  }
  
  try {
    const wsId = await getCurrentWorkspaceId();
    
    // Use the correct key source
    const key = wsId ? await getWorkspaceKey() : await generateSyncKey();
    if (!key) {
      addSyncLog('Failed to generate or retrieve encryption key', 'error');
      throw new Error('Failed to generate or retrieve encryption key');
    }
    
    // 🔧 IMPORTANT: Ensure we're encrypting the EXACT data we just verified
    const cipher = encryptSnapshot(allStates, key);

    let uri: string;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(WEB_SNAPSHOT_KEY, cipher);
      }
      uri = `web://localStorage/${WEB_SNAPSHOT_KEY}`;
    } else {
      uri = `${FileSystem.documentDirectory}stateSnapshot.enc`;
      await FileSystem.writeAsStringAsync(uri, cipher, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }
    
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