// permissionService.ts
// This service handles all permission requests for the app.
import { Alert, Platform } from 'react-native';
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

// Show permission explanation dialog
export const showPermissionExplanation = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  // Check if permissions have already been explained
  const explained = await havePermissionsBeenExplained();
  if (explained) return;
  
  // Show the explanation dialog
  Alert.alert(
    "App Permissions",
    "This app requires the following permissions to provide its full functionality:\n\n" +
    "• Contacts: To help you manage your relationships and set birthday reminders\n" +
    "• Calendar: To help you manage events and appointments\n" +
    "• Photo Library: To allow you to select profile pictures and upload images\n" +
    "• Notifications: To remind you of upcoming events, birthdays, and tasks\n\n" +
    "You can manage these permissions in your device settings at any time.",
    [
      { 
        text: "OK", 
        style: "default",
        onPress: async () => {
          // Mark permissions as explained after the user dismisses the dialog
          await markPermissionsAsExplained();
        }
      }
    ]
  );
};
