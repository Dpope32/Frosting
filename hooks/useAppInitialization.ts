import { useEffect } from 'react';
import { useThunderStore } from '@/store/ThunderStore';

export function useAppInitialization() {
  useEffect(() => {
    const initializeApp = async () => {
      // Only sync tasks from existing data in the store
      // This won't trigger any API calls
      useThunderStore.getState().syncGameTasks();
    };

    initializeApp();
  }, []);
}
