import React, { useState, useEffect } from 'react';
import { View, Alert, Platform, Switch, ScrollView } from 'react-native';
import { YStack, Text, Button, XStack, Separator } from 'tamagui';
import { Bell, Clock, Settings } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore';
import { useNotifications } from '@/hooks/useNotifications';
import { testNotification } from '@/services/notificationServices';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

export default function NotificationsTestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { preferences, setPreferences } = useUserStore();
  const primaryColor = preferences.primaryColor;
  const notificationsEnabled = preferences.notificationsEnabled;
  const isWeb = Platform.OS === 'web';
  const [isScheduling, setIsScheduling] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  
  // Initialize notifications
  useNotifications();

  // Check notification permission status
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const checkPermissions = async () => {
        try {
          const { status } = await Notifications.getPermissionsAsync();
          setPermissionStatus(status);
        } catch (error) {
          console.error('Error checking notification permissions:', error);
        }
      };
      
      checkPermissions();
    }
  }, []);
  
  const toggleNotifications = (value: boolean) => {
    setPreferences({ notificationsEnabled: value });
  };

  const testScheduledNotification = async () => {
    try {
      setIsScheduling(true);
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Error', 'Failed to get notification permissions');
          setIsScheduling(false);
          return;
        }
      }
      
      // Schedule a notification for 100 seconds in the future
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Scheduled Test',
          body: 'This notification was scheduled 100 seconds ago!',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          autoDismiss: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: new Date(Date.now() + 100000), // 100 seconds
          channelId: 'test-channel',
        },
      });
      
      Alert.alert('Success', 'Notification scheduled for 100 seconds from now!');
      setIsScheduling(false);
    } catch (error) {
      Alert.alert('Error', String(error));
      setIsScheduling(false);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Success', 'All scheduled notifications have been cancelled');
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: isDark ? '#000' : '#fff' }}
      contentContainerStyle={{ padding: 16, paddingTop: isWeb ? 60 : 100, paddingBottom: 100 }}
      showsVerticalScrollIndicator={true}
    >
      <YStack gap="$6">
        <XStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap="$4"
        >
          <YStack flex={1} minWidth={200} gap="$1">
            <Text fontFamily="$body" fontSize="$6" fontWeight="bold" color={isDark ? '#fff' : '#000'}>
              Notification Testing
            </Text>
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              This screen is only available in development mode. Notifications currently only work on mobile.
            </Text>
          </YStack>
        </XStack>
        
        <YStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          gap="$4"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <Settings size={20} color={isDark ? '#ccc' : '#666'} />
              <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={isDark ? '#fff' : '#000'}>
                Notification Settings
              </Text>
            </XStack>
            
            {!isWeb && (
              <XStack alignItems="center" gap="$2" flexWrap="wrap">
                <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
                  Permission: 
                </Text>
                <Text 
                  fontFamily="$body" 
                  fontSize="$3" 
                  fontWeight="bold" 
                  color={permissionStatus === 'granted' ? '#4CAF50' : '#FF5252'}
                >
                  {permissionStatus === 'granted' ? 'Granted' : permissionStatus}
                </Text>
              </XStack>
            )}
          </XStack>
          
          <Separator borderColor={isDark ? '#333' : '#e0e0e0'} />
          
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontFamily="$body" fontSize="$4" color={isDark ? '#fff' : '#000'}>
              Enable Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </XStack>
          
          <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
            {notificationsEnabled 
              ? 'Notifications are enabled. You will receive notifications when the app is in the background.'
              : 'Notifications are disabled. You will not receive any notifications.'}
          </Text>
          
          {permissionStatus === 'undetermined' && (
            <Text fontFamily="$body" fontSize="$3" color="#FF9800" fontStyle="italic">
              Note: On simulators, permission status may show as "undetermined" until you explicitly grant or deny permission.
            </Text>
          )}
        </YStack>

        <YStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          gap="$4"
        >
          <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={isDark ? '#fff' : '#000'}>
            Test Notifications
          </Text>
          
          <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
            Use these buttons to test different types of notifications. Make sure your device has notifications enabled.
          </Text>
          
          <XStack flexWrap="wrap" gap="$4" paddingTop="$2">
            <Button
              size="$4"
              backgroundColor={primaryColor}
              pressStyle={{ opacity: 0.8 }}
              onPress={testNotification}
              icon={<Bell color="white" size={20} />}
              disabled={!notificationsEnabled && Platform.OS !== 'web'}
            >
              <Text color="white" fontWeight="600">
                Test Immediate Notification
              </Text>
            </Button>
            
            <Button
              size="$4"
              backgroundColor="#ff9500"
              pressStyle={{ opacity: 0.8 }}
              onPress={testScheduledNotification}
              disabled={isScheduling}
              icon={<Clock color="white" size={20} />}
            >
              <Text color="white" fontWeight="600">
                {isScheduling ? 'Scheduling...' : 'Test Scheduled Notification (100s)'}
              </Text>
            </Button>
            
          </XStack>
        </YStack>
        
        <YStack
          backgroundColor={isDark ? '#1a1a1a' : '#f5f5f5'}
          padding="$4"
          borderRadius="$4"
          borderWidth={1}
          borderColor={isDark ? '#333' : '#e0e0e0'}
          gap="$4"
        >
          <Text fontFamily="$body" fontSize="$5" fontWeight="bold" color={isDark ? '#fff' : '#000'}>
            Instructions
          </Text>
          
          <YStack gap="$2">
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              1. For immediate notifications, you should see a notification appear almost instantly.
            </Text>
            
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              2. For scheduled notifications, you can lock your screen or put the app in the background to test if they appear after the specified delay (100 seconds).
            </Text>
            
            <Text fontFamily="$body" fontSize="$3" color={isDark ? '#ccc' : '#666'}>
              3. Use the cancel button to clear any pending scheduled notifications.
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </ScrollView>
  );
}
