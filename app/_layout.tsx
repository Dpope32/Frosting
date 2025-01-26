import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

import { useColorScheme } from '@/hooks/useColorScheme';
import { queryClient } from '@/lib/query';
import { useUserStore } from '@/store/UserStore';
import { Toast } from '@/components/Toast';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log('[RootLayout] Rendering');
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);
  console.log('[RootLayout] hasCompletedOnboarding:', hasCompletedOnboarding);

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'dark'}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
