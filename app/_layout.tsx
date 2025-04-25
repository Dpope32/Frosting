import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { Linking, Platform } from 'react-native';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NotificationResponse } from 'expo-notifications';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore';
import { Toast } from '@/components/Toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { TaskRecommendationModal } from '@/components/recModals/TaskRecommendationModal';
import { EditStockModal } from '@/components/cardModals/EditStockModal';
import { handleSharedContact } from '../services/shareService';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import * as Sentry from '@sentry/react-native'; 

Sentry.init({
  dsn: 'https://fc15d194ba82cd269fad099757600f7e@o4509079625662464.ingest.us.sentry.io/4509079639621632',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({});

  if (Platform.OS !== 'web') {
    useNotifications();
    useCalendarSync();
  } else {
    inject();
    injectSpeedInsights();
  }

  // Hide splash screen after critical initializations complete
  useEffect(() => {
    const hideSplash = async () => {
      if (!loaded) return;
      
      // Create a promise that resolves after a timeout
      const timeoutPromise = new Promise(resolve => {
        setTimeout(resolve, 3000); // Maximum 3 seconds wait
      });
      
      // Wait for either fonts and user store hydration OR timeout
      await Promise.race([
        // Wait for both fonts and user store hydration
        Promise.all([
          new Promise(resolve => {
            const unsubscribe = useUserStore.subscribe((state) => {
              if (state.hydrated) {
                unsubscribe();
                resolve(null);
              }
            });
          })
        ]),
        // Timeout after 3 seconds
        timeoutPromise
      ]);

      // Hide splash screen regardless of what happened above
      await SplashScreen.hideAsync().catch(() => {
        console.log('Splash screen hide failed, continuing anyway');
      });
    };

    hideSplash();
  }, [loaded]);

  // Move update check to a separate effect to not block initial render
  useEffect(() => {
    if (!loaded || __DEV__) return;

    const checkAndApplyUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          
          if (Platform.OS !== 'web') {
            Alert.alert(
              'Update Available',
              'A new version is ready. Restart to apply?',
              [
                { text: 'Later', style: 'cancel' },
                { 
                  text: 'Restart', 
                  onPress: () => Updates.reloadAsync() 
                }
              ]
            );
          } else {
            if (window.confirm('Update available. Reload to apply?')) {
              Updates.reloadAsync();
            }
          }
        }
      } catch (error) {
        console.error('Update check failed:', error);
      }
    };
    
    // Initial check with a delay to not block app startup
    setTimeout(checkAndApplyUpdate, 2000);
    
    // Periodic checks
    const updateInterval = setInterval(checkAndApplyUpdate, 60000);
    
    return () => clearInterval(updateInterval);
  }, [loaded]);

  const handleDeepLink = useCallback((event: { url: string | NotificationResponse }) => {
    console.log('Handling deep link:', event.url);
    
    // Handle notification response
    if (typeof event.url === 'object' && 'notification' in event.url) {
      const url = event.url.notification.request.content.data?.url;
      if (url) {
        router.push(url.replace('kaiba-nexus://', '/(drawer)/'));
        return;
      }
    }
    
    // Handle URL-based deep links
    if (typeof event.url === 'string' && event.url.startsWith('kaiba-nexus://share')) {
      const url = new URL(event.url);
      const params = Object.fromEntries(url.searchParams.entries());
      const contactData = {
        name: decodeURIComponent(params.name || ''),
        nickname: params.nickname ? decodeURIComponent(params.nickname) : undefined,
        phoneNumber: params.phone ? decodeURIComponent(params.phone) : undefined,
        email: params.email ? decodeURIComponent(params.email) : undefined,
        occupation: params.occupation ? decodeURIComponent(params.occupation) : undefined
      };
      handleSharedContact(contactData);
    } else if (typeof event.url === 'string' && event.url.startsWith('kaiba-nexus://habits')) {
      // Route to habits screen
      router.push('/(drawer)/habits');
    }
  }, []);

  useEffect(() => {
    // Set up notification response handler
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleDeepLink({ url: response });
    });

    // Set up URL-based deep link handler
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const urlSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      notificationSubscription.remove();
      urlSubscription.remove();
    };
  }, [handleDeepLink]);

  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'dark'}>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ErrorBoundary>
            <>
              <Stack screenOptions={{ headerShown: false }}>
                {!hasCompletedOnboarding ? (
                  <Stack.Screen  name="screens/onboarding/index" options= {{ gestureEnabled: false }}/>) : (
                <Stack.Screen  name="(drawer)" />)}
            </Stack>
            <Toast />
            <StatusBar style="auto" />
              <TaskRecommendationModal />
              <EditStockModal />
            </>
          </ErrorBoundary>
        </NavigationThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
});
