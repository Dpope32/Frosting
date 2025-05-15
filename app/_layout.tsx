//@ts-nocheck
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import { Linking, Platform, AppState } from 'react-native';
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
import { useRegistryStore } from '@/store/RegistryStore';
import { Toast } from '@/components/Toast';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { TaskRecommendationModal } from '@/components/recModals/TaskRecommendationModal';
import { EditStockModal } from '@/components/cardModals/edits/EditStockModal';
import { handleSharedContact } from '../services/shareService';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import * as Sentry from '@sentry/react-native'; 
import { addSyncLog } from '@/components/sync/syncUtils';
// Preload sync modules to avoid dynamic import issues on Android
import * as syncModules from '@/sync/snapshotPushPull';
import * as registryModules from '@/sync/registrySyncManager';

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
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({});

  if (Platform.OS !== 'web') {
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
        setTimeout(resolve, 2500); // Maximum 3 seconds wait
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
        // Check if we're in emergency launch mode
        const isEmergencyLaunch = Updates.isEmergencyLaunch;
        
        if (isEmergencyLaunch) {
          console.log('App is running in emergency launch mode');
          // Show a notification about emergency mode
          if (Platform.OS !== 'web') {
            Alert.alert(
              'Running in Emergency Mode',
              'The app is currently running in emergency recovery mode due to an issue with the latest update. Some features may be limited.',
              [{ text: 'OK' }]
            );
          }
          // In emergency mode, we might want to be more cautious with updates
          // or implement special handling for backwards compatibility
          return; // Skip normal update checking in emergency mode
        }
        
        // Normal update flow
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
    setTimeout(checkAndApplyUpdate, 2500);
    
    // Periodic checks
    const updateInterval = setInterval(checkAndApplyUpdate, 30000);
    
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

  // Add background sync for premium users
  useEffect(() => {
    if (!loaded) return;
    
    const isPremium = useUserStore.getState().preferences.premium === true;
    if (!isPremium) return;
    
    addSyncLog('🔄 Setting up background sync handler', 'verbose');
    
    const handleAppStateChange = async (nextAppState: string) => {
      const currentState = useUserStore.getState().preferences;
      const isPremium = currentState.premium === true;
      const username = currentState.username || 'unknown';
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App going to background, triggering sync for premium user:', username);
        
        if (isPremium) {
          try {
            addSyncLog('📱 App going to background - initiating sync', 'info');
            
            // Use preloaded modules instead of dynamic imports for Android compatibility
            try {
              // Export and push data
              addSyncLog('🗄️ Background sync: Exporting & encrypting state', 'info');
              const allStates = useRegistryStore.getState().getAllStoreStates();
              
              // Verify we have store data before exporting
              const storeKeys = Object.keys(allStates);
              if (storeKeys.length === 0) {
                addSyncLog('⚠️ Background sync: No store states found to export', 'warning');
                return;
              }
              
              await registryModules.exportEncryptedState(allStates);
              addSyncLog('🔐 Background sync: State encrypted & saved', 'success');
              
              addSyncLog('📤 Background sync: Pushing snapshot → server', 'info');
              await syncModules.pushSnapshot();
              addSyncLog('✅ Background sync: Push completed successfully', 'success');
            } catch (importError) {
              console.error('Failed to use sync modules:', importError);
              addSyncLog(
                '🔥 Failed to use sync modules',
                'error',
                importError instanceof Error ? importError.message : String(importError)
              );
            }
          } catch (error) {
            console.error('Background sync failed:', error);
            addSyncLog(
              '🔥 Background sync failed',
              'error',
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      } else if (nextAppState === 'active') {
        console.log('App came to foreground');
        addSyncLog('📱 App returned to foreground', 'verbose');
      }
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
      addSyncLog('🔄 Background sync handler removed', 'verbose');
    };
  }, [loaded]);

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
