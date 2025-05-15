import { useEffect } from 'react';
import { addSyncLog } from '@/components/sync/syncUtils';

export function useLifecycleLogger() {
  useEffect(() => {
    addSyncLog('SyncScreen mounted', 'info');
    return () => addSyncLog('SyncScreen unmounted', 'info');
  }, []);
  
} 