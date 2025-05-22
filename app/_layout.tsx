// File: app/_layout.tsx
import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Linking, Platform } from 'react-native';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from '@/hooks/useColorScheme';

import { useUserStore } from '@/store/UserStore';
import { Toast } from '@/components/Toast';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { TaskRecommendationModal } from '@/components/recModals/TaskRecommendationModal';
import { EditStockModal } from '@/components/cardModals/edits/EditStockModal';
import { handleDeepLink } from '@/services/notifications/deepLinkHandler';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import * as Sentry from '@sentry/react-native';
import { useAppUpdateCheck } from '@/hooks/useAppUpdateCheck';
import { useAppStateSync } from '@/hooks/useAppStateSync';

Sentry.init({
  dsn: 'https://fc15d194ba82cd269fad099757600f7e@o4509079625662464.ingest.us.sentry.io/4509079639621632',
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  profilesSampleRate: 1.0,
  environment: 'production',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({});

  // native‐only calendar sync
  if (Platform.OS !== 'web') {
    useCalendarSync();
  } else {
    inject();
    injectSpeedInsights();
  }

  // hide splash once fonts + store hydration complete (or after 2.5s)
  useEffect(() => {
    async function hide() {
      if (!loaded) return;
      const timeout = new Promise(resolve => setTimeout(resolve, 2500));
      await Promise.race([
        new Promise(resolve => {
          const unsub = useUserStore.subscribe(state => {
            if (state.hydrated) {
              unsub();
              resolve(null);
            }
          });
        }),
        timeout,
      ]);
      await SplashScreen.hideAsync().catch(() => {
        console.log('Splash screen hide failed, continuing anyway');
      });
    }
    hide();
  }, [loaded]);

  // check for OTA updates
  useAppUpdateCheck(loaded);

  // wire up background/pull sync automatically
  useAppStateSync(loaded);

  // deep‐link handlers
  useEffect(() => {
    const notifSub = Notifications.addNotificationResponseReceivedListener(response => {
      handleDeepLink({ url: response });
    });
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });
    const urlSub = Linking.addEventListener('url', handleDeepLink);

    return () => {
      notifSub.remove();
      urlSub.remove();
    };
  }, [handleDeepLink]);

  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'dark'}>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ErrorBoundary>
            <>
              <Stack screenOptions={{ headerShown: false }}>
                {!hasCompletedOnboarding
                  ? <Stack.Screen name="screens/onboarding/index" options={{ gestureEnabled: false }} />
                  : <Stack.Screen name="(drawer)" />}
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