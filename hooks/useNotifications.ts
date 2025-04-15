import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useUserStore } from '@/store/UserStore';
import * as Notifications from 'expo-notifications';
import { configureNotifications } from '@/services/notificationServices';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS_EXPLAINED_KEY } from '@/constants/KEYS';

export function useNotifications() {
  const { preferences } = useUserStore();
  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    
    async function setupNotifications() {
      try {
        if (!hasCompletedOnboarding) {
          return;
        }
        const permissionsExplained = await AsyncStorage.getItem(PERMISSIONS_EXPLAINED_KEY);
        if (permissionsExplained !== 'true') {
          return;
        }
        
        await configureNotifications();

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: preferences.notificationsEnabled,
            shouldPlaySound: preferences.notificationsEnabled,
            shouldSetBadge: false,
          }),
        });

        // Set up notification listeners
        const subscription = Notifications.addNotificationReceivedListener(notification => {
         // console.log('Notification received:', notification);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
          console.log('Notification response:', response);
          //  TODO: add navigation logic here if needed when a user taps on a notification
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
