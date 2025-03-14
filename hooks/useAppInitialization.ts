import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThunderStore } from '@/store/ThunderStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useNBAStore } from '@/store/NBAStore';
import { useSportsAPI } from './useSportsAPI';
import { configureNotifications } from '@/services/notificationServices';
import { useUserStore } from '@/store/UserStore';
import { useColorScheme as useRNColorScheme, ColorSchemeName } from 'react-native';

// Theme storage key - must match the one in useColorScheme.ts/useColorScheme.web.ts
const THEME_STORAGE_KEY = '@frosting/color-scheme';

// Modified function that doesn't use hooks
export async function preloadTheme(systemColorScheme: ColorSchemeName) {
  try {
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
  // Get the system theme using the hook properly at the top level
  const systemColorScheme = useRNColorScheme();
  
  // Initialize Thunder and NBA schedules
  useSportsAPI();
  
  // Initialize app without requesting permissions
  // Permissions will be requested after the user views the permissions screen
  useEffect(() => {
    const initializeApp = async () => {
      // We no longer request permissions here
      // This is now handled in the onboarding flow
      
      // Pre-load the theme to prevent theme bounce
      // Pass the systemColorScheme to the function instead of calling the hook inside
      await preloadTheme(systemColorScheme);
    };
    
    initializeApp();
  }, [systemColorScheme]); // Add systemColorScheme as a dependency

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