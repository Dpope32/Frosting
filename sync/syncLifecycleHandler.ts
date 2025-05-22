// File: sync/syncLifecycleHandler.ts
import { addSyncLog } from '@/components/sync/syncUtils';
import { useRegistryStore } from '@/store/RegistryStore';
import { pullLatestSnapshot, pushSnapshot } from '@/sync/snapshotPushPull';
import { exportEncryptedState } from '@/sync/registrySyncManager';
import { useProjectStore as useTaskStore } from '@/store/ToDo';

export async function handleAppStateChange(nextAppState: string) {
  const registry = useRegistryStore.getState();
  const { syncStatus, setSyncStatus, getAllStoreStates } = registry;

  if (syncStatus === 'syncing') {
    addSyncLog(`🔄 Sync in progress, skipping ${nextAppState}`, 'verbose');
    return;
  }

  setSyncStatus('syncing');
  try {
    if (nextAppState === 'active') {
      addSyncLog('📥 App resumed – pulling latest snapshot', 'info');
      await pullLatestSnapshot();
      setTimeout(() => {
        useTaskStore.getState().recalculateTodaysTasks();
        addSyncLog('🔄 Recalculated today’s tasks', 'info');
      }, 500);
      addSyncLog('✅ Resume pull completed', 'success');
    } else {
      addSyncLog('📤 App backgrounded – pushing snapshot', 'info');
      const all = getAllStoreStates();
      await exportEncryptedState(all);
      await pushSnapshot();
      addSyncLog('✅ Background push completed', 'success');
    }
  } catch (e: any) {
    setSyncStatus('error');
    addSyncLog(
      nextAppState === 'active' ? '❌ Resume pull failed' : '❌ Background push failed',
      'error',
      e.message
    );
  } finally {
    setSyncStatus('idle');
  }
}