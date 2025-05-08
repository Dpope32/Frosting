// sync/pocketSync.ts
import * as FileSystem from 'expo-file-system';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { decryptSnapshot } from '@/lib/encryption';
import { useRegistryStore } from '@/store/RegistryStore';
import { useUserStore } from '@/store/UserStore';

const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://192.168.1.32:8090';
// We'll use type-only imports to help TypeScript understand the PocketBase types
// without actually importing the module at compile time
type PocketBaseType = any; // We'll use 'any' for now since we're dynamically importing


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
// Replace your existing getPocketBase function with this:
const getPocketBase = async (): Promise<PocketBaseType> => {
  try {
    // First check if the PocketBase server is reachable
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);
      
      const response = await fetch(`${PB_URL}/api/health`, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Silently skip syncing if server isn't available
        throw new Error('SKIP_SYNC_SILENTLY');
      }
    } catch (error) {
      // Any fetch error means server is unreachable
      throw new Error('SKIP_SYNC_SILENTLY');
    }
    
    // If we get here, server is reachable, proceed normally
    const PocketBaseModule = await import('pocketbase');
    const PocketBase = PocketBaseModule.default;
    return new PocketBase(PB_URL);
  } catch (error: unknown) {
    // Type-safe error handling
    if (error instanceof Error && error.message === 'SKIP_SYNC_SILENTLY') {
      throw error; // Re-throw our special error
    }
    console.error('Failed to load PocketBase:', error);
    throw error;
  }
};

// Modify your pushSnapshot function to handle the silent skip:
export const pushSnapshot = async (): Promise<void> => {
  try {
    // Your existing checks remain unchanged
    const hasCompletedOnboarding = getOnboardingStatus();
    if (!hasCompletedOnboarding) {
      console.log('⏸️ Skipping PocketBase push - onboarding not completed');
      return;
    }
    
    // Your existing network check
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      console.log('⏸️ Skipping PocketBase push - no network connection');
      return;
    }
    
    // Now try to get PocketBase instance
    try {
      const pb = await getPocketBase();
      
      // Continue with your existing code
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
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'SKIP_SYNC_SILENTLY') {
        // Just log but don't set error state
        console.log('⏸️ Skipping PocketBase push - server not available');
        return;
      }
      // Re-throw for the outer catch block
      throw error;
    }
  } catch (error: unknown) {
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
