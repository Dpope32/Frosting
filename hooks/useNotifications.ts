import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '@/store/UserStore';
import * as Notifications from 'expo-notifications';
import { configureNotifications } from '@/services/notificationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key for storing whether permissions have been explained
const PERMISSIONS_EXPLAINED_KEY = '@frosting/permissions_explained';

export function useNotifications() {
  const { preferences } = useUserStore();
  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);
  
  useEffect(() => {
    // Skip notifications setup on web platform
    if (Platform.OS === 'web') {
      return;
    }
    
    async function setupNotifications() {
      try {
        // Check if onboarding is completed and permissions have been explained
        if (!hasCompletedOnboarding) {
          console.log('Onboarding not completed, skipping notifications setup');
          return;
        }
        
        // Check if permissions have been explained
        const permissionsExplained = await AsyncStorage.getItem(PERMISSIONS_EXPLAINED_KEY);
        if (permissionsExplained !== 'true') {
          console.log('Permissions not yet explained, skipping notifications setup');
          return;
        }
        
        // Configure notifications with our enhanced setup
        await configureNotifications();
        
        // Override notification handler based on user preferences
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: preferences.notificationsEnabled,
            shouldPlaySound: preferences.notificationsEnabled,
            shouldSetBadge: false,
          }),
        });

        // Set up notification listeners
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          // You could add navigation logic here if needed when a user taps on a notification
        });

        return () => {
          subscription.remove();
          responseSubscription.remove();
        };
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupNotifications();
  }, [preferences.notificationsEnabled]);
}
