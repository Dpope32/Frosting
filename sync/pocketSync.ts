// sync/pocketSync.ts
import * as FileSystem from 'expo-file-system';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { decryptSnapshot } from '@/lib/encryption';
import { useRegistryStore } from '@/store/RegistryStore';
import { useUserStore } from '@/store/UserStore';
import * as Sentry from '@sentry/react-native';

const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://192.168.1.32:8090';
// We'll use type-only imports to help TypeScript understand the PocketBase types
// without actually importing the module at compile time
type PocketBaseType = any; // We'll use 'any' for now since we're dynamically importing

/**
 * Check if the application has network connectivity.
 * This is a simple check that doesn't require extra dependencies.
 */
const checkNetworkConnectivity = async (): Promise<boolean> => {
  Sentry.addBreadcrumb({
    category: 'pocketSync',
    message: 'checkNetworkConnectivity called',
    level: 'info',
  });
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
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Network check result',
      data: { ok: response.ok },
      level: 'info',
    });
    return response.ok;
  } catch (error) {
    Sentry.captureException(error);
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Network check failed',
      data: { error },
      level: 'warning',
    });
    console.warn('Network check failed:', error);
    return false;
  }
};


// Replace your existing getPocketBase function with this:
const getPocketBase = async (): Promise<PocketBaseType> => {
  Sentry.addBreadcrumb({
    category: 'pocketSync',
    message: 'getPocketBase called',
    level: 'info',
  });
  try {
    // First check if the PocketBase server is reachable
    try {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Checking PocketBase server health',
        data: { url: `${PB_URL}/api/health` },
        level: 'info',
      });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 500);
      const response = await fetch(`${PB_URL}/api/health`, { 
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        Sentry.addBreadcrumb({
          category: 'pocketSync',
          message: 'PocketBase health check failed (not ok)',
          data: { status: response.status },
          level: 'warning',
        });
        throw new Error('SKIP_SYNC_SILENTLY');
      }
    } catch (error) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'PocketBase server unreachable',
        data: { error },
        level: 'warning',
      });
      // Any fetch error means server is unreachable
      throw new Error('SKIP_SYNC_SILENTLY');
    }
    // If we get here, server is reachable, proceed normally
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'PocketBase server reachable, loading PocketBase',
      level: 'info',
    });
    const PocketBaseModule = await import('pocketbase');
    const PocketBase = PocketBaseModule.default;
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'PocketBase loaded successfully',
      level: 'info',
    });
    return new PocketBase(PB_URL);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'SKIP_SYNC_SILENTLY') {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Skipping sync silently due to unreachable server',
        level: 'warning',
      });
      throw error; // Re-throw our special error
    }
    Sentry.captureException(error);
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Failed to load PocketBase',
      data: { error },
      level: 'error',
    });
    console.error('Failed to load PocketBase:', error);
    throw error;
  }
};

// Modify your pushSnapshot function to handle the silent skip:
export const pushSnapshot = async (): Promise<void> => {
  const isPremium = useUserStore.getState().preferences.premium === true;
  if (!isPremium) return;
  Sentry.addBreadcrumb({
    category: 'pocketSync',
    message: 'pushSnapshot called',
    level: 'info',
  });
  try {
    // Your existing checks remain unchanged
    const hasCompletedOnboarding = (useUserStore.getState().preferences.hasCompletedOnboarding);
    if (!hasCompletedOnboarding) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Skipping push - onboarding not completed',
        level: 'warning',
      });
      console.log('⏸️ Skipping PocketBase push - onboarding not completed');
      return;
    }
    
    // Your existing network check
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Skipping push - no network connection',
        level: 'warning',
      });
      console.log('⏸️ Skipping PocketBase push - no network connection');
      return;
    }
    
    const pb = await getPocketBase();
    const deviceId = await generateSyncKey();
    const cipher = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}stateSnapshot.enc`
    );
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Pushing snapshot to PocketBase',
      data: { deviceId },
      level: 'info',
    });
    await pb.collection('registry_snapshots').create({
      device_id: deviceId,
      snapshot_blob: cipher,
      timestamp: new Date().toISOString(),
    });
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Successfully pushed data to PocketBase',
      level: 'info',
    });
    console.log('✅ Successfully pushed data to PocketBase');
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'SKIP_SYNC_SILENTLY') {
      // Just log but don't set error state
      console.log('⏸️ Skipping PocketBase push - server not available');
      return;
    }
    Sentry.captureException(error);
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Error pushing to PocketBase',
      data: { error },
      level: 'error',
    });
    console.error('❌ Error pushing to PocketBase:', error);
    useRegistryStore.getState().setSyncStatus('error');
  }
};



/**  
 * Pull the most recent snapshot for this device, decrypt it, and hydrate your stores.  
 */
export const pullLatestSnapshot = async (): Promise<void> => {
  const isPremium = useUserStore.getState().preferences.premium === true;
  if (!isPremium) return;
  Sentry.addBreadcrumb({
    category: 'pocketSync',
    message: 'pullLatestSnapshot called',
    level: 'info',
  });
  try {
    // Check if onboarding is completed before proceeding
    const hasCompletedOnboarding = (useUserStore.getState().preferences.hasCompletedOnboarding);
    if (!hasCompletedOnboarding) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Skipping pull - onboarding not completed',
        level: 'warning',
      });
      console.log('⏸️ Skipping PocketBase pull - onboarding not completed');
      return;
    }
    
    // Simple network check
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Skipping pull - no network connection',
        level: 'warning',
      });
      console.log('⏸️ Skipping PocketBase pull - no network connection');
      return;
    }
    
    const pb = await getPocketBase();
    const deviceId = await generateSyncKey();
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Pulling latest snapshot from PocketBase',
      data: { deviceId },
      level: 'info',
    });
    const list = await pb
      .collection('registry_snapshots')
      .getList(1, 1, {
        filter: `device_id="${deviceId}"`,
        sort: '-created',
      });

    if (list.items.length === 0) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'No snapshots found for this device',
        level: 'info',
      });
      console.log('ℹ️ No snapshots found for this device');
      return;
    }

    const blob = list.items[0].snapshot_blob;
    const key = await generateSyncKey();
    const data = decryptSnapshot(blob, key);

    // Set sync status before hydration
    useRegistryStore.getState().setSyncStatus('syncing');
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Hydrating all stores with pulled data',
      level: 'info',
    });
    // Hydrate all stores with the data
    useRegistryStore.getState().hydrateAll(data);
    useRegistryStore.getState().setSyncStatus('idle');
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Successfully pulled and hydrated data from PocketBase',
      level: 'info',
    });
    console.log('✅ Successfully pulled and hydrated data from PocketBase');
  } catch (error) {
    Sentry.captureException(error);
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Error pulling from PocketBase',
      data: { error },
      level: 'error',
    });
    console.error('❌ Error pulling from PocketBase:', error);
    useRegistryStore.getState().setSyncStatus('error');
  }
};
