import { useEffect } from 'react';
import { useThunderStore } from '@/store/ThunderStore';
import { useSportsAPI } from './useSportsAPI';

export function useAppInitialization() {
  // Initialize Thunder schedule
  useSportsAPI();

  // Initial sync of existing tasks
  useEffect(() => {
    useThunderStore.getState().syncGameTasks();
  }, []);
}