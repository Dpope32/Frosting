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

const WEB_SNAPSHOT_KEY = 'encrypted_state_snapshot';

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
  addSyncLog('Exporting encrypted state in registrySyncManager.ts', 'info');
  Sentry.addBreadcrumb({
    category: 'sync',
    message: 'exportEncryptedState called',
    level: 'info',
  });
  
  // Add prune analysis here
  if (allStates.TaskStore?.tasks) {
    const tasks = allStates.TaskStore.tasks;
    const completedOneTimeTasks = tasks.filter((task: any) => 
      task.pattern === 'one-time' && task.completed === true
    );

    if (!allStates.TaskStore.tasks) {
      addSyncLog('No tasks found in TaskStore for some reason?', 'error');
      throw new Error('No tasks found in TaskStore');
    }
    
    addSyncLog(`🔍 Prune analysis: Found ${completedOneTimeTasks.length} completed one-time tasks`, 'info');
    
    if (completedOneTimeTasks.length > 0) {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const pruneCandidates = completedOneTimeTasks.filter((task: any) => {
        const completedDate = new Date(task.updatedAt || task.createdAt);
        return completedDate < thirtyDaysAgo;
      });
      
      addSyncLog(`📋 Prune candidates: ${pruneCandidates.length} tasks completed >30 days ago`, 'info');
      
      if (pruneCandidates.length > 0) {
        pruneCandidates.slice(0, 5).forEach((task: any) => {
          const completedDate = new Date(task.updatedAt || task.createdAt);
          const daysAgo = Math.floor((now.getTime() - completedDate.getTime()) / (24 * 60 * 60 * 1000));
          addSyncLog(`🗑️ Prune candidate: "${task.name}" (completed ${daysAgo} days ago)`, 'verbose');
        });
        
        if (pruneCandidates.length > 5) {
          addSyncLog(`... and ${pruneCandidates.length - 5} more prune candidates`, 'verbose');
        }
      } else {
        addSyncLog('✅ No prune candidates found (all completed tasks are <30 days old)', 'info');
      }
    } else {
      addSyncLog('ℹ️ No completed one-time tasks found', 'info');
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
    //addSyncLog(`🔑 Using key hash ${key.slice(0,6)}…${key.slice(-6)}`, 'verbose');
    const cipher = encryptSnapshot(allStates, key);
    const sha = CryptoJS.SHA256(cipher).toString().slice(0,8);
    //addSyncLog(`📦 Snapshot SHA ${sha}`, 'verbose');
    
    // Web compatibility: use localStorage instead of FileSystem
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