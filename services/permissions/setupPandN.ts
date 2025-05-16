import { configureNotifications } from '@/services/notificationServices';
import { useUserStore } from '@/store';
// Function to handle permission requests and notification setup
// This will be called from the onboarding flow after the user views the permissions screen
export async function setupPermissionsAndNotifications(permissions: any) {
    // Configure notifications if permission granted
    if (permissions.notifications) {
      await configureNotifications();
    }
    // Update user preferences with permission status
    useUserStore.getState().setPreferences({
      notificationsEnabled: permissions.notifications
    });
    return true;
  }