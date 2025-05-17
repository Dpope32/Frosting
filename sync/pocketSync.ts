// sync/pocketSync.ts
import { generateSyncKey } from '@/sync/registrySyncManager';
import { useUserStore } from '@/store';
import * as Sentry from '@sentry/react-native';
import { addSyncLog, LogEntry } from '@/components/sync/syncUtils';

const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://192.168.1.32:8090';
// We'll use type-only imports to help TypeScript understand the PocketBase types
// without actually importing the module at compile time
type PocketBaseType = any; // We'll use 'any' for now since we're dynamically importing

/**
 * Check if the application has network connectivity.
 * This is a simple check that doesn't require extra dependencies.
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
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


/**
 * Get a PocketBase instance
 * This is a wrapper around the PocketBase constructor
 * It also handles the case where the PocketBase server is not reachable
 * and skips the sync silently
 */
export const getPocketBase = async (): Promise<PocketBaseType> => {
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
        method: 'GET',
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
        addSyncLog('PocketBase server unreachable', 'error');
        throw new Error('SKIP_SYNC_SILENTLY');
      }
    } catch (error) {
      Sentry.addBreadcrumb({
        category: 'pocketSync',
        message: 'PocketBase server unreachable',
        data: { error },
        level: 'warning',
      });
      addSyncLog('PocketBase server unreachable (catch)', 'error');
      throw new Error('SKIP_SYNC_SILENTLY');
    }
    // If we get here, server is reachable, proceed normally
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'PocketBase server reachable, loading PocketBase',
      level: 'info',
    });
    const PocketBaseModule = await import('pocketbase');
    addSyncLog('PocketBase module loaded', 'info');
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
      addSyncLog('Skipping sync silently due to unreachable server :(', 'warning');
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


/**
 * Export sync logs to PocketBase for debugging purposes
 * This is a wrapper around the PocketBase collection 'debug_logs'
 * It also checks if the user is premium
 * If the user is not premium, it will not export the logs
 */
export const exportLogsToServer = async (logs: LogEntry[]): Promise<void> => {
  const isPremium = useUserStore.getState().preferences.premium === true;
  if (!isPremium) return;
  addSyncLog('Exporting logs to PocketBase', 'info');
  Sentry.addBreadcrumb({
    category: 'pocketSync',
    message: 'exportLogsToServer called',
    level: 'info',
  });
  
  try {
    // Check network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new Error('No network connection available');
    }
    
    // Get device identifier
    const deviceId = await generateSyncKey();
    const username = useUserStore.getState().preferences.username || 'unknown';
    // Get PocketBase instance
    const pb = await getPocketBase();
    addSyncLog('PocketBase instance created', 'info');
    // Format the logs for storage
    const formattedLogs = {
      device_id: deviceId,
      username: username,
      timestamp: new Date().toISOString(),
      logs: JSON.stringify(logs),
    };
    
    // Upload to a debug_logs collection
    await pb.collection('debug_logs').create(formattedLogs);
    addSyncLog('Logs created in PocketBase', 'info');
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Successfully exported logs to PocketBase',
      level: 'info',
    });
    console.log('✅ Successfully exported logs to PocketBase');
    
  } catch (error) {
    Sentry.captureException(error);
    Sentry.addBreadcrumb({
      category: 'pocketSync',
      message: 'Error exporting logs to PocketBase',
      data: { error },
      level: 'error',
    });
    console.error('❌ Error exporting logs to PocketBase:', error);
    throw error; // Rethrow to handle in the UI
  }
};
