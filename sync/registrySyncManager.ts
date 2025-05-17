// src/sync/registrySyncManager.ts
import { storage } from '@/store/AsyncStorage';
import { addSyncLog } from '@/components/sync/syncUtils';
import { getPocketBase } from './pocketSync';
import { generateRandomKey } from './randomKey';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useUserStore } from '@/store';

const WS_KEY_PREFIX = 'ws_key_'; 

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
    console.log('Using stored device ID for sync operations', storedDeviceId.substring(0, 8) + '...');
    return storedDeviceId;
  }
  
  // If no stored ID (fallback), create a new one using your existing generateRandomKey function
  const deviceInfo = Platform.OS + '-' + Platform.Version;
  const timestamp = Date.now().toString(36);
  const randomKey = generateRandomKey(); // Use your existing function
  const newDeviceId = `${deviceInfo}-${timestamp}-${randomKey.substring(0, 12)}`.replace(/\s+/g, '-');
  
  // Store for future use
  await AsyncStorage.setItem(deviceIdKey, newDeviceId);
  console.log('Generated new device ID for sync:', newDeviceId.substring(0, 8) + '...');
  
  return newDeviceId;
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

// Add a new function to register device with workspace
export const registerDeviceWithWorkspace = async (workspaceId: string, deviceId: string) => {
  try {
    const pb = await getPocketBase();
    
    // Get current workspace record
    const workspace = await pb.collection('sync_workspaces').getOne(workspaceId);
    
    // Clean up device_ids array: remove empty strings and duplicates
    let deviceIds = workspace.device_ids || [];
    deviceIds = deviceIds.filter((id: string) => id && id.trim() !== '');
    deviceIds = [...new Set(deviceIds)]; // Remove duplicates
    
    // Add current device if not already present
    if (!deviceIds.includes(deviceId)) {
      deviceIds.push(deviceId);
      console.log('Registering device with workspace:', deviceId.substring(0, 8) + '...');
      
      // Update workspace record
      await pb.collection('sync_workspaces').update(workspaceId, {
        device_ids: deviceIds
      });
    }
  } catch (error) {
    console.error('Failed to register device with workspace:', error);
  }
};
