// sync/pocketSync.ts
import * as FileSystem from 'expo-file-system';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { decryptSnapshot } from '@/lib/encryption';
import { useRegistryStore } from '@/store/RegistryStore';
import { useUserStore } from '@/store/UserStore';
import * as Sentry from '@sentry/react-native';
import { checkNetworkConnectivity, getPocketBase } from './pocketSync';
import { getCurrentWorkspaceId } from './workspace';
import { addSyncLog } from '@/components/sync/syncUtils';
// Modify your pushSnapshot function to handle the silent skip:
export const pushSnapshot = async (): Promise<void> => {
    const isPremium = useUserStore.getState().preferences.premium === true;
    if (!isPremium) return;
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'pushSnapshot called',
      level: 'info',
    });
    addSyncLog('Pushing snapshot to PocketBase', 'info');
    try {
      // Your existing checks remain unchanged
      const hasCompletedOnboarding = (useUserStore.getState().preferences.hasCompletedOnboarding);
      if (!hasCompletedOnboarding) {
        Sentry.addBreadcrumb({
          category: 'pocketSync',
          message: 'Skipping push - onboarding not completed',
          level: 'warning',
        });
        addSyncLog('Skipping PocketBase push - onboarding not completed', 'warning');
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
        addSyncLog('Skipping PocketBase push - no network connection', 'warning');
        return;
      }
      
      const pb = await getPocketBase();
      const workspaceId = await getCurrentWorkspaceId();
      if (!workspaceId) {
        throw new Error("No workspace configured");
      }
      
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
        workspace_id: workspaceId,
        device_id: deviceId,
        snapshot_blob: cipher,
        timestamp: new Date().toISOString(),
      });
      addSyncLog('Successfully pushed data to PocketBase', 'info');
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Successfully pushed data to PocketBase',
        level: 'info',
      });
      addSyncLog('Successfully pushed data to PocketBase', 'info');
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'SKIP_SYNC_SILENTLY') {
        addSyncLog('Skipping PocketBase push - server not available', 'warning');
        return;
      }
      Sentry.captureException(error);
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Error pushing to PocketBase',
        data: { error },
        level: 'error',
      });
      addSyncLog('Error pushing to PocketBase', 'error', error instanceof Error ? error.message : String(error));
      useRegistryStore.getState().setSyncStatus('error');
      throw error;
    }
  };
  
  
  
  /**  
   * Pull the most recent snapshot for this device, decrypt it, and hydrate your stores.  
   */
  export const pullLatestSnapshot = async (): Promise<void> => {
    const isPremium = useUserStore.getState().preferences.premium === true;
    if (!isPremium) return;
    addSyncLog('Pulling latest snapshot from PocketBase', 'info');
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
        addSyncLog('Skipping PocketBase pull - onboarding not completed', 'warning');
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
        addSyncLog('Skipping PocketBase pull - no network connection', 'warning');
        return;
      }
      
      const pb = await getPocketBase();
      const workspaceId = await getCurrentWorkspaceId();
      if (!workspaceId) {
        throw new Error("No workspace configured");
      }
      
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Pulling latest snapshot from PocketBase',
        data: { workspaceId },
        level: 'info',
      });
      const list = await pb
        .collection('registry_snapshots')
        .getList(1, 1, {
          filter: `workspace_id="${workspaceId}"`,
          sort: '-created',
        });
  
      if (list.items.length === 0) {
        Sentry.addBreadcrumb({
          category: 'pocketSync',
          message: 'No snapshots found for this workspace',
          level: 'info',
        });
        addSyncLog('No snapshots found for this workspace', 'info');
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
      addSyncLog('Successfully pulled and hydrated data from PocketBase', 'info');
    } catch (error) {
      Sentry.captureException(error);
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'Error pulling from PocketBase',
        data: { error },
        level: 'error',
      });
      addSyncLog('Error pulling from PocketBase', 'error', error instanceof Error ? error.message : String(error));
      useRegistryStore.getState().setSyncStatus('error');
      throw error;
    }
  };
  