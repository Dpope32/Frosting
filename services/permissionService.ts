// permissionService.ts
// This service handles all permission requests for the app.
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Calendar conditionally to avoid issues on web
let Calendar: any = null;
if (Platform.OS !== 'web') {
  // Use require instead of dynamic import for better compatibility
  try {
    Calendar = require('expo-calendar');
  } catch (err) {
    console.error('Error importing expo-calendar:', err);
  }
}

// Key for storing whether permissions have been explained
const PERMISSIONS_EXPLAINED_KEY = '@frosting/permissions_explained';

// Request all permissions at once
export const requestAllPermissions = async () => {
  if (Platform.OS === 'web') return { 
    notifications: true, 
    camera: true, 
    contacts: true,
    calendar: true
  };
  
  try {
    const notificationStatus = await requestNotificationPermissions();
    const photoLibraryStatus = await requestPhotoLibraryPermissions();
    const contactsStatus = await requestContactsPermissions();
    const calendarStatus = await requestCalendarPermissions();
    
    return {
      notifications: notificationStatus,
      photoLibrary: photoLibraryStatus,
      contacts: contactsStatus,
      calendar: calendarStatus
    };
  } catch (error) {
    console.error("Error requesting permissions:", error);
    return {
      notifications: false,
      photoLibrary: false,
      contacts: false,
      calendar: false
    };
  }
};

// Request all permissions with a delay
export const requestPermissionsWithDelay = async (delayMs = 1000) => {
  // Mark permissions as explained since we're showing our custom screen
  await markPermissionsAsExplained();
  
  // Return immediately on web
  if (Platform.OS === 'web') return { 
    notifications: true, 
    camera: true, 
    contacts: true,
    calendar: true
  };
  
  // Add a delay before requesting permissions
  return new Promise((resolve) => {
    setTimeout(async () => {
      try {
        const permissions = await requestAllPermissions();
        resolve(permissions);
      } catch (error) {
        console.error("Error requesting permissions with delay:", error);
        resolve({
          notifications: false,
          photoLibrary: false,
          contacts: false,
          calendar: false
        });
      }
    }, delayMs);
  });
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return true;
  
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

// Request photo library permissions
export const requestPhotoLibraryPermissions = async () => {
  if (Platform.OS === 'web') return true;
  
  try {
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  } catch (error) {
    console.error("Error requesting photo library permissions:", error);
    return false;
  }
};

// Request contacts permissions
export const requestContactsPermissions = async () => {
  if (Platform.OS === 'web') return true;
  
  try {
    const { status } = await Contacts.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Contacts.requestPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  } catch (error) {
    console.error("Error requesting contacts permissions:", error);
    return false;
  }
};

// Request calendar permissions
export const requestCalendarPermissions = async () => {
  if (Platform.OS === 'web') return true;
  
  // If Calendar module is not available, return true to ensure the rest of the app works
  if (!Calendar) {
    console.error("Calendar module not available");
    return true;
  }
  
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Calendar.requestCalendarPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  } catch (error) {
    console.error("Error requesting calendar permissions:", error);
    // Return true even if there's an error to ensure the rest of the app works
    return true;
  }
};

// Check if permissions have been explained
export const havePermissionsBeenExplained = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(PERMISSIONS_EXPLAINED_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking if permissions have been explained:', error);
    return false;
  }
};

// Mark permissions as explained
export const markPermissionsAsExplained = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(PERMISSIONS_EXPLAINED_KEY, 'true');
    console.log("PERMISSIONS_EXPLAINED_KEY SETTING KEY to TRUE! VALUE: " , PERMISSIONS_EXPLAINED_KEY)
  } catch (error) {
    console.error('Error marking permissions as explained:', error);
  }
};

// Show permission explanation dialog - kept for backward compatibility
// but we now use a dedicated permissions screen instead
export const showPermissionExplanation = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  // Check if permissions have already been explained
  const explained = await havePermissionsBeenExplained();
  if (explained) return;
  
  // We're not showing the alert anymore, just marking as explained
  // since we now have a dedicated permissions screen
  await markPermissionsAsExplained();
};
