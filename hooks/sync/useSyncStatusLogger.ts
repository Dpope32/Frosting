import { useEffect } from 'react';
import { addSyncLog } from '@/components/sync/syncUtils';

export function useSyncStatusLogger(syncStatus: string, isLoading: boolean) {
  useEffect(() => {
    addSyncLog(`Sync status: ${syncStatus}, Loading: ${isLoading}`, 'verbose');
  }, [syncStatus, isLoading]);
} 