import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '@/store/UserStore';

export function useNotifications() {
  const { preferences } = useUserStore();
  
  useEffect(() => {
    // Skip notifications setup on web platform
    if (Platform.OS === 'web') {
      return;
    }
    
    async function setupNotifications() {
      try {
        // Dynamically import Notifications to prevent web bundling issues
        const Notifications = await import('expo-notifications');
        
        // Set up notification handler
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: preferences.notificationsEnabled,
            shouldPlaySound: preferences.notificationsEnabled,
            shouldSetBadge: false,
          }),
        });

        // Set up channels for Android
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('birthdays', {
            name: 'Birthdays',
            importance: Notifications.AndroidImportance.MAX,
            sound: 'default',
          });

          await Notifications.setNotificationChannelAsync('test-channel', {
            name: 'Test Notifications',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        // Set up notification listeners
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          console.log('Notification received:', notification);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
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
