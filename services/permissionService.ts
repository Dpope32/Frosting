// permissionService.ts
// This service handles the permission requests for notifications.

export const requestNotificationPermissions = async () => {
    try {
      const Notifications = require('expo-notifications');
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    } catch (error) {
      console.log("Error requesting notification permissions:", error);
    }
  };