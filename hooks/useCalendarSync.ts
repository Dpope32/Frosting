import { useEffect, useState } from 'react';
import { useCalendarStore, useUserStore } from '@/store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS_EXPLAINED_KEY } from '@/constants'
import { getCalendarPermissionStatus } from '@/services/permissions/permissionService';

let permissionService: any = null;
if (Platform.OS !== 'web') {
  try {
    permissionService = require('@/services/permissions/permissionService');
  } catch (err) {
    console.error('Error importing permissionService:', err);
  }
}


export const useCalendarSync = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const syncDeviceCalendarEvents = useCalendarStore(state => state.syncDeviceCalendarEvents);
  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);
  const calendarPermission = useUserStore(state => state.preferences.calendarPermission);
  const setPreferences = useUserStore(state => state.setPreferences);
  
  useEffect(() => {
    // Patch calendarPermission for existing users if undefined
    if (calendarPermission === undefined && Platform.OS !== 'web') {
      getCalendarPermissionStatus().then((granted) => {
        setPreferences({ calendarPermission: granted });
      });
    } 
    // Only run once, only on non-web platforms, and only if onboarding is completed
    if (isInitialized || Platform.OS === 'web') return;
    const initializeCalendarSync = async () => {
      try {
        // Check if onboarding is completed and permissions have been explained
        if (!hasCompletedOnboarding) {
          return;
        }
        // Check if permissions have been explained
        const permissionsExplained = await AsyncStorage.getItem(PERMISSIONS_EXPLAINED_KEY);
        if (permissionsExplained !== 'true') {
          return;
        }
        // Only request permissions if we have the permission service and onboarding is completed
        let hasPermission = false;
        if (permissionService && permissionService.requestCalendarPermissions) {
          hasPermission = await permissionService.requestCalendarPermissions();
        }
        if (hasPermission) {
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 6);
          setTimeout(() => {
            syncDeviceCalendarEvents(startDate, endDate)
              .then(() => {
              })
              .catch(error => {
                console.error('Calendar sync failed:', error);
              });
          }, 2000); 
        } 
      } catch (error) {
        console.error('Error initializing calendar sync:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    initializeCalendarSync();
  }, [isInitialized, syncDeviceCalendarEvents])
  return null;
};
