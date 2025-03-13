import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/store/CalendarStore';
import { Platform } from 'react-native';

// Import permissionService conditionally to avoid issues on web
let requestCalendarPermissions: () => Promise<boolean> = async () => true;
if (Platform.OS !== 'web') {
  try {
    const permissionService = require('@/services/permissionService');
    requestCalendarPermissions = permissionService.requestCalendarPermissions;
  } catch (err) {
    console.error('Error importing permissionService:', err);
  }
}

/**
 * Hook to sync device calendar events with the app
 * This hook will run the sync in the background when the app starts
 */
export const useCalendarSync = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const syncDeviceCalendarEvents = useCalendarStore(state => state.syncDeviceCalendarEvents);
  
  useEffect(() => {
    // Only run once and only on non-web platforms
    if (isInitialized || Platform.OS === 'web') return;
    
    const initializeCalendarSync = async () => {
      try {
        // Request calendar permissions
        const hasPermission = await requestCalendarPermissions();
        
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
