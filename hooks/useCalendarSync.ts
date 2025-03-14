import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/CalendarStore';
import { Platform } from 'react-native';
import { useUserStore } from '@/store/UserStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import permissionService conditionally to avoid issues on web
let permissionService: any = null;
if (Platform.OS !== 'web') {
  try {
    permissionService = require('@/services/permissionService');
  } catch (err) {
    console.error('Error importing permissionService:', err);
  }
}

// Key for storing whether permissions have been explained
const PERMISSIONS_EXPLAINED_KEY = '@frosting/permissions_explained';

/**
 * Hook to sync device calendar events with the app
 * This hook will run the sync in the background when the app starts
 * but only if the user has completed onboarding
 */
export const useCalendarSync = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const syncDeviceCalendarEvents = useCalendarStore(state => state.syncDeviceCalendarEvents);
  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);
  
  useEffect(() => {
    // Only run once, only on non-web platforms, and only if onboarding is completed
    if (isInitialized || Platform.OS === 'web') return;
    
    const initializeCalendarSync = async () => {
      try {
        // Check if onboarding is completed and permissions have been explained
        if (!hasCompletedOnboarding) {
          console.log('Onboarding not completed, skipping calendar sync');
          return;
        }
        
        // Check if permissions have been explained
        const permissionsExplained = await AsyncStorage.getItem(PERMISSIONS_EXPLAINED_KEY);
        if (permissionsExplained !== 'true') {
          console.log('Permissions not yet explained, skipping calendar sync');
          return;
        }
        
        // Only request permissions if we have the permission service and onboarding is completed
        let hasPermission = false;
        if (permissionService && permissionService.requestCalendarPermissions) {
          hasPermission = await permissionService.requestCalendarPermissions();
        }
        
        if (hasPermission) {
          console.log('Calendar permissions granted, syncing events in background...');
          
          // Sync events for the next 6 months
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 6);
          
          // Run sync in background
          setTimeout(() => {
            syncDeviceCalendarEvents(startDate, endDate)
              .then(() => {
                console.log('Calendar sync completed successfully');
              })
              .catch(error => {
                console.error('Calendar sync failed:', error);
                // Even if sync fails, we don't want to block the app
              });
          }, 2000); // Delay by 2 seconds to not block app startup
        } else {
          console.log('Calendar permissions not granted');
        }
      } catch (error) {
        console.error('Error initializing calendar sync:', error);
        // Continue even if there's an error
      } finally {
        setIsInitialized(true);
      }
    };
    
    // Start initialization
    initializeCalendarSync();
    
    // No cleanup needed
  }, [isInitialized, syncDeviceCalendarEvents]);
  
  // This hook doesn't render anything
  return null;
};
