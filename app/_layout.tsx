import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
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
import { handleSharedContact } from '../services/shareService'

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

  if (Platform.OS !== 'web') {
    useNotifications();
    useCalendarSync();
  }

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const checkAndApplyUpdate = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert('Update downloaded', 'Restarting app to apply update...');
          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log('Failed to fetch update:', error);
      }
    };
  
    if (loaded) {
      checkAndApplyUpdate();
    }
  }, [loaded]);

  const handleDeepLink = useCallback((event: { url: string }) => {
    if (event.url.startsWith('kaiba-nexus://share')) {
      handleSharedContact(event.url);
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
        </NavigationThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
