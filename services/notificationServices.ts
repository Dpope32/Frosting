// StorageScreen.tsx
import { Alert } from 'react-native'
import * as Notifications from 'expo-notifications'
import { SchedulableTriggerInputTypes } from 'expo-notifications'

export const testNotification = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      const { status } = await Notifications.getPermissionsAsync()
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync()
        if (newStatus !== 'granted') {
          Alert.alert('Error', 'Failed to get notification permissions')
          return
        }
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Immediate Test',
          body: 'This should show right now!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          autoDismiss: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 1000),
          channelId: 'test-channel',
        },
      })
      Alert.alert('Success', 'Immediate notification sent!')
    } catch (error) {
      Alert.alert('Error', String(error))
    }
  }