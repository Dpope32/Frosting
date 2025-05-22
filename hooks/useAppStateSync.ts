// File: hooks/useAppStateSync.ts
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useUserStore } from '@/store/UserStore';
import { addSyncLog } from '@/components/sync/syncUtils';
import { handleAppStateChange } from '@/sync/syncLifecycleHandler';

export function useAppStateSync(loaded: boolean) {
  const hydrated = useUserStore(state => state.hydrated);
  const premium   = useUserStore(state => state.preferences.premium);

  useEffect(() => {
    if (!loaded || !hydrated || !premium) return;

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
      addSyncLog('🔄 Sync handler removed', 'verbose');
    };
  }, [loaded, hydrated, premium]);
}