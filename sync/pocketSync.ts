// sync/pocketSync.ts
import * as FileSystem from 'expo-file-system';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { decryptSnapshot } from '@/lib/encryption';
import { useRegistryStore } from '@/store/RegistryStore';
import { useUserStore } from '@/store/UserStore';

// Set your PocketBase server URL here
const PB_URL = 'http://YOUR_SERVER_IP:8090';

// We'll use type-only imports to help TypeScript understand the PocketBase types
// without actually importing the module at compile time
type PocketBaseType = any; // We'll use 'any' for now since we're dynamically importing

// Get a PocketBase instance using dynamic import
const getPocketBase = async (): Promise<PocketBaseType> => {
  try {
    // Dynamic import of PocketBase
    const PocketBaseModule = await import('pocketbase');
    const PocketBase = PocketBaseModule.default;
    return new PocketBase(PB_URL);
  } catch (error) {
    console.error('Failed to load PocketBase:', error);
    throw error;
  }
};

/**
 * Check if the application has network connectivity.
 * This is a simple check that doesn't require extra dependencies.
 */
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Use a timeout controller for fetch to prevent long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Try to fetch a small resource to verify connectivity
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Network check failed:', error);
    return false;
  }
};

/**
 * Ensures that onboarding status is consistent between stores
 */
const getOnboardingStatus = (): boolean => {
  const userOnboarding = useUserStore.getState().preferences.hasCompletedOnboarding;
  const registryOnboarding = useRegistryStore.getState().hasCompletedOnboarding;
  
  // Ensure registry store is in sync with user store
  if (registryOnboarding !== userOnboarding) {
    useRegistryStore.getState().setHasCompletedOnboarding(userOnboarding);
  }
  
  return userOnboarding;
};

/**  
 * Push the latest encrypted snapshot up to PocketBase.  
 */
export const pushSnapshot = async (): Promise<void> => {
  try {
    // Check if onboarding is completed before proceeding
    const hasCompletedOnboarding = getOnboardingStatus();
    if (!hasCompletedOnboarding) {
      console.log('⏸️ Skipping PocketBase push - onboarding not completed');
      return;
    }
    
    // Simple network check
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      console.log('⏸️ Skipping PocketBase push - no network connection');
      return;
    }
    
    const pb = await getPocketBase();
    const deviceId = await generateSyncKey();
    const cipher = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}stateSnapshot.enc`
    );

    await pb.collection('registry_snapshots').create({
      device_id: deviceId,
      snapshot_blob: cipher,
      timestamp: new Date().toISOString(),
    });
    
    console.log('✅ Successfully pushed data to PocketBase');
  } catch (error) {
    console.error('❌ Error pushing to PocketBase:', error);
    useRegistryStore.getState().setSyncStatus('error');
  }
};

/**  
 * Pull the most recent snapshot for this device, decrypt it, and hydrate your stores.  
 */
export const pullLatestSnapshot = async (): Promise<void> => {
  try {
    // Check if onboarding is completed before proceeding
    const hasCompletedOnboarding = getOnboardingStatus();
    if (!hasCompletedOnboarding) {
      console.log('⏸️ Skipping PocketBase pull - onboarding not completed');
      return;
    }
    
    // Simple network check
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      console.log('⏸️ Skipping PocketBase pull - no network connection');
      return;
    }
    
    const pb = await getPocketBase();
    const deviceId = await generateSyncKey();
    
    const list = await pb
      .collection('registry_snapshots')
      .getList(1, 1, {
        filter: `device_id="${deviceId}"`,
        sort: '-created',
      });

    if (list.items.length === 0) {
      console.log('ℹ️ No snapshots found for this device');
      return;
    }

    const blob = list.items[0].snapshot_blob;
    const key = await generateSyncKey();
    const data = decryptSnapshot(blob, key);

    // Set sync status before hydration
    useRegistryStore.getState().setSyncStatus('syncing');
    
    // Hydrate all stores with the data
    useRegistryStore.getState().hydrateAll(data);
    useRegistryStore.getState().setSyncStatus('idle');
    console.log('✅ Successfully pulled and hydrated data from PocketBase');
  } catch (error) {
    console.error('❌ Error pulling from PocketBase:', error);
    useRegistryStore.getState().setSyncStatus('error');
  }
};
