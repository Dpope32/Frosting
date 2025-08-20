// src/sync/registrySyncManager.ts
import { addSyncLog } from '@/components/sync/syncUtils';
import { generateRandomKey } from './randomKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { getCurrentWorkspaceId } from './getWorkspace';
import { getWorkspaceKey } from './workspaceKey';
import { encryptSnapshot } from '@/utils/encryption';
import * as FileSystem from 'expo-file-system';
import { format } from 'date-fns';
import pako from 'pako';

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
  
  // If no stored ID (fallback), create a new one using existing generateRandomKey function
  // Fix Platform.Version for web compatibility since it's not available on web
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
  const exportTimer = Date.now();
  
  // PERFORMANCE TIMING: Check size of each store with detailed breakdown
  let totalSize = 0;
  const storeBreakdown: Record<string, number> = {};
  
  Object.keys(allStates).forEach(storeKey => {
    const storeTimer = Date.now();
    const size = JSON.stringify(allStates[storeKey]).length;
    const storeTime = Date.now() - storeTimer;
    
    totalSize += size;
    storeBreakdown[storeKey] = size;
    
    // Log slow stores (>50ms to serialize)
    if (storeTime > 50) {
      addSyncLog(`🐌 [EXPORT] Store "${storeKey}" serialization took ${storeTime}ms (${(size/1024).toFixed(1)}KB)`, 'warning');
    }
  });
  
  // Log store size breakdown for largest stores
  const largestStores = Object.entries(storeBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([store, size]) => `${store}=${(size/1024).toFixed(1)}KB`)
    .join(', ');
  
  const totalMB = (totalSize / 1024 / 1024).toFixed(2);
  addSyncLog(`Total snapshot size: ${totalMB}MB`, 'info');
  addSyncLog(`📊 [EXPORT] Largest stores: ${largestStores}`, 'info');

  if (allStates.tasks?.tasks) {
    const tasks = Object.values(allStates.tasks.tasks) as any[];
    const today = format(new Date(), 'yyyy-MM-dd'); 
    

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
    const keyTimer = Date.now();
    const wsId = await getCurrentWorkspaceId();
    
    // Use the correct key source
    const key = wsId ? await getWorkspaceKey() : await generateSyncKey();
    if (!key) {
      addSyncLog('Failed to generate or retrieve encryption key', 'error');
      throw new Error('Failed to generate or retrieve encryption key');
    }
    const keyTime = Date.now() - keyTimer;
    addSyncLog(`🔑 [EXPORT] Key generation took ${keyTime}ms`, keyTime > 100 ? 'warning' : 'verbose');
    
      // 🔧 IMPORTANT: Ensure we're encrypting the EXACT data we just verified
      const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
      };
      
      // PERFORMANCE TIMING: Break down export phases
      const stringifyTimer = Date.now();
      const jsonString = JSON.stringify(allStates);
      const stringifyTime = Date.now() - stringifyTimer;
      addSyncLog(`📝 [EXPORT] JSON.stringify took ${stringifyTime}ms for ${(jsonString.length/1024).toFixed(1)}KB`, stringifyTime > 500 ? 'warning' : 'verbose');
      
      const compressTimer = Date.now();
      const compressed = pako.deflate(jsonString); // Returns Uint8Array
      const compressTime = Date.now() - compressTimer;
      addSyncLog(`🗜️ [EXPORT] Compression took ${compressTime}ms`, compressTime > 500 ? 'warning' : 'verbose');
      
      const encodeTimer = Date.now();
      const compressedString = uint8ArrayToBase64(compressed);
      const encodeTime = Date.now() - encodeTimer;
      addSyncLog(`🔤 [EXPORT] Base64 encoding took ${encodeTime}ms`, encodeTime > 100 ? 'warning' : 'verbose');
      
      const encryptTimer = Date.now();
      const cipher = encryptSnapshot(compressedString, key);
      const encryptTime = Date.now() - encryptTimer;
      addSyncLog(`🔐 [EXPORT] Encryption took ${encryptTime}ms`, encryptTime > 200 ? 'warning' : 'verbose');
      
      addSyncLog(`Compression: ${(jsonString.length/1024).toFixed(1)}KB → ${(compressed.length/1024).toFixed(1)}KB (${((compressed.length/jsonString.length)*100).toFixed(1)}% of original)`, 'info');
          
    // PERFORMANCE TIMING: File write operation
    const writeTimer = Date.now();
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
    const writeTime = Date.now() - writeTimer;
    addSyncLog(`💾 [EXPORT] File write took ${writeTime}ms`, writeTime > 500 ? 'warning' : 'verbose');
    
    // FINAL EXPORT TIMING
    const totalExportTime = Date.now() - exportTimer;
    addSyncLog(`⏱️ [EXPORT] Total export phase took ${totalExportTime}ms`, totalExportTime > 2000 ? 'warning' : 'success');
    
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