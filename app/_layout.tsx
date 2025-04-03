import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
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

import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore';
import { Toast } from '@/components/Toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { TaskRecommendationModal } from '@/components/modals/TaskRecommendationModal';
import { EditStockModal } from '@/components/cardModals/EditStockModal';
import { handleSharedContact } from '../services/shareService';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import * as Sentry from '@sentry/react-native'; 

Sentry.init({
  dsn: 'https://fc15d194ba82cd269fad099757600f7e@o4509079625662464.ingest.us.sentry.io/4509079639621632',
  // (https://spotlightjs.com)
  // spotlight: __DEV__,
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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const checkAndApplyUpdate = async () => {
      if (__DEV__) return;
      
      try {
        const update = await Updates.checkForUpdateAsync();
        
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          
          // Platform-safe alert implementation
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
            // Web-friendly confirmation 
            if (window.confirm('Update available. Reload to apply?')) {
              Updates.reloadAsync();
            }
          }
        }
      } catch (error) {
        console.error('Update check failed:', error);
      }
    };
  
    // Only run when loaded and not in dev mode
    if (loaded && !__DEV__) {
      // Initial check
      checkAndApplyUpdate();
      
      // Periodic checks
      const updateInterval = setInterval(checkAndApplyUpdate, 60000);
      
      return () => clearInterval(updateInterval);
    }
  }, [loaded]);

    const handleDeepLink = useCallback((event: { url: string }) => {
      if (event.url.startsWith('kaiba-nexus://share')) {
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
      }
  }, []);

  useEffect(() => {

    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
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
}); // Close Sentry.wrap
