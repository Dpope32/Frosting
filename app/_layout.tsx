import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { Linking } from 'react-native';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore';
import { Toast } from '@/components/Toast';
import { useNotifications } from '@/hooks/useNotifications';
import React from 'react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({});

  // Add this line
  useNotifications();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle deep links
  const handleDeepLink = useCallback((event: { url: string }) => {
    if (event.url.startsWith('frosting://share')) {
      const { handleSharedContact } = require('@/components/crm/PersonCard/PersonCard');
      handleSharedContact(event.url);
    }
  }, []);

  useEffect(() => {
    // Handle deep link if app was opened with one
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Handle deep links when app is already running
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
          <>
            <Stack screenOptions={{ headerShown: false }}>
              {!hasCompletedOnboarding ? (
                <Stack.Screen  name="screens/onboarding/index" options= {{ gestureEnabled: false }}/>) : ( 
                <Stack.Screen  name="(drawer)" />)}
            </Stack>
            <Toast />
            <StatusBar style="auto" />
          </>
        </NavigationThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
