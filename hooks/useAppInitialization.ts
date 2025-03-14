import { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThunderStore } from '@/store/ThunderStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useNBAStore } from '@/store/NBAStore';
import { useSportsAPI } from './useSportsAPI';
import { configureNotifications } from '@/services/notificationServices';
import { useUserStore } from '@/store/UserStore';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Theme storage key - must match the one in useColorScheme.ts/useColorScheme.web.ts
const THEME_STORAGE_KEY = '@frosting/color-scheme';

// Pre-load the theme to prevent theme bounce
export async function preloadTheme() {
  try {
    // Get the current system theme
    const systemColorScheme = useRNColorScheme();
    
    if (systemColorScheme) {
      // Check if we already have a stored theme
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      
      // If no stored theme or it's different from system theme, update it
      if (!storedTheme || storedTheme !== systemColorScheme) {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, systemColorScheme);
      }
    }
  } catch (error) {
    console.error('Error preloading theme:', error);
  }
}

export function useAppInitialization() {
  // Initialize Thunder and NBA schedules
  useSportsAPI();
  
  // Initialize app without requesting permissions
  // Permissions will be requested after the user views the permissions screen
  useEffect(() => {
    const initializeApp = async () => {
      // We no longer request permissions here
      // This is now handled in the onboarding flow
      
      // Pre-load the theme to prevent theme bounce
      await preloadTheme();
    };
    
    initializeApp();
  }, []);

  // Initial sync of existing tasks and birthdays
  useEffect(() => {
    // Sync Thunder games to tasks
    useThunderStore.getState().syncGameTasks();
    
    // Sync NBA games to tasks and calendar
    useNBAStore.getState().syncNBAGames();
    useNBAStore.getState().syncGameTasks();
    
    // Sync birthdays to calendar
    useCalendarStore.getState().syncBirthdays();
  }, []);
}

// Function to handle permission requests and notification setup
// This will be called from the onboarding flow after the user views the permissions screen
export async function setupPermissionsAndNotifications(permissions: any) {
  // Configure notifications if permission granted
  if (permissions.notifications) {
    await configureNotifications();
  }
  
  // Update user preferences with permission status
  useUserStore.getState().setPreferences({
    notificationsEnabled: permissions.notifications
  });
  
  return true;
}
