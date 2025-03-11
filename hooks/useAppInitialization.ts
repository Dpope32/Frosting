import { useEffect } from 'react';
import { useThunderStore } from '@/store/ThunderStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useNBAStore } from '@/store/NBAStore';
import { useSportsAPI } from './useSportsAPI';

export function useAppInitialization() {
  // Initialize Thunder and NBA schedules
  useSportsAPI();

  // Initial sync of existing tasks and birthdays
  useEffect(() => {
    // Sync Thunder games to tasks
    useThunderStore.getState().syncGameTasks();
    
    // Sync NBA games to tasks and calendar
    useNBAStore.getState().syncGameTasks();
    useNBAStore.getState().syncNBAGames();
    
    // Sync birthdays to calendar
    useCalendarStore.getState().syncBirthdays();
  }, []);
}
