import { Alert, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes, AndroidNotificationPriority } from 'expo-notifications'

// Configure notifications to work properly even when the app is in the background
export const configureNotifications = async () => {
  if (Platform.OS === 'web') return;
  
  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Set up channels for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('events', {
        name: 'Calendar Events',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      
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
  } catch (error) {
    console.error('Error configuring notifications:', error);
  }
};

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'web') return true;
  
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== 'granted') {
        Alert.alert('Notification Permission', 'Please enable notifications to receive reminders for your events.');
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Schedule a notification for a specific date and time
export const scheduleEventNotification = async (
  date: Date, 
  title: string, 
  body: string, 
  identifier?: string
) => {
  if (Platform.OS === 'web') return 'web-not-supported';
  
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return 'permission-denied';
    
    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        autoDismiss: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date,
        channelId: Platform.OS === 'android' ? 'events' : undefined,
      },
      identifier,
    });
    
    return notifId;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return 'error';
  }
};

export const testNotification = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Immediate Test',
        body: 'This should show right now!',
        sound: true,
        priority: AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
        autoDismiss: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + 1000),
        channelId: 'test-channel',
      },
    });
    Alert.alert('Success', 'Immediate notification sent!');
  } catch (error) {
    Alert.alert('Error', String(error));
  }
};
