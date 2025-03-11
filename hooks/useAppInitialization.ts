import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useThunderStore } from '@/store/ThunderStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useNBAStore } from '@/store/NBAStore';
import { useSportsAPI } from './useSportsAPI';
import { requestAllPermissions, showPermissionExplanation } from '@/services/permissionService';
import { configureNotifications } from '@/services/notificationServices';
import { useUserStore } from '@/store/UserStore';

export function useAppInitialization() {
  // Initialize Thunder and NBA schedules
  useSportsAPI();
  
  // Request permissions and initialize notifications
  useEffect(() => {
    const initializeApp = async () => {
      // Show permission explanation dialog (will only show if not already explained)
      await showPermissionExplanation();
      
      // Request all permissions
      const permissions = await requestAllPermissions();
      
      // Configure notifications if permission granted
      if (permissions.notifications) {
        await configureNotifications();
      }
      
      // Update user preferences with permission status
      useUserStore.getState().setPreferences({
        notificationsEnabled: permissions.notifications
      });
    };
    
    initializeApp();
  }, []);

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
