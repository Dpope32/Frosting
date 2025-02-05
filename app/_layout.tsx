import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useUserStore } from '@/store/UserStore';
import { Toast } from '@/components/Toast';

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
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
                <Stack.Screen 
                  name="screens/onboarding/index"
                  options={{ gestureEnabled: false }}
                />
              ) : (
                <Stack.Screen 
                  name="(drawer)"
                />
              )}
            </Stack>
            <Toast />
            <StatusBar style="auto" />
          </>
        </NavigationThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}