import { Alert, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'

/**
 * Cancel notification helper specifically for habit module
 * This function is separate from the main notification services to avoid circular dependencies
 */
export const cancelHabitNotification = async (identifier: string) => {
  if (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') return;
  try {
    // For recurring notifications (like habits), we need to check for both daily triggers
    // and one-time triggers that might have been scheduled
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const matchingNotifications = scheduledNotifications.filter(
      notification => notification.identifier === identifier
    );
    
    if (matchingNotifications.length > 0) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } else {
      // If no exact match found, try to find notifications that might be for this habit
      // This handles cases where the identifiers might have been generated differently
      const habitIdentifier = identifier.split('-')[0]; // Extract habit name
      if (habitIdentifier) {
        const possibleMatches = scheduledNotifications.filter(
          notification => notification.identifier && notification.identifier.startsWith(habitIdentifier)
        );
        
        // Cancel all possible matching notifications
        for (const notification of possibleMatches) {
          if (notification.identifier) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
};
