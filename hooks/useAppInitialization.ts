import { useEffect } from 'react';
import { useThunderStore } from '@/store/ThunderStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useSportsAPI } from './useSportsAPI';

export function useAppInitialization() {
  // Initialize Thunder schedule
  useSportsAPI();

  // Initial sync of existing tasks and birthdays
  useEffect(() => {
    useThunderStore.getState().syncGameTasks();
    useCalendarStore.getState().syncBirthdays();
  }, []);
}
