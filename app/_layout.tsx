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
import { useUserStore, useRegistryStore } from '@/store';
import { Toast } from '@/components/Toast';
import { useCalendarSync } from '@/hooks';
import { TaskRecommendationModal } from '@/components/recModals/TaskRecommendationModal';
import { EditStockModal } from '@/components/cardModals/edits/EditStockModal';
import { AddStockModal } from '@/components/cardModals/creates/AddStockModal';
import { handleSharedContact } from '@/services';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import * as Sentry from '@sentry/react-native'; 
import { addSyncLog } from '@/components/sync/syncUtils';
import { pushSnapshot, pullLatestSnapshot, } from '@/sync/snapshotPushPull';
import { useProjectStore as useTaskStore } from '@/store/ToDo';
import { exportEncryptedState } from '@/sync/registrySyncManager';
import { handleDeepLink } from '@/services/notifications/deepLinkHandler';  
import { initializePremiumService } from '@/services';
import { usePremiumVerification } from '@/hooks/sync/usePremiumVerification';
import { EventModal } from '@/components/calendar/EventModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarModals } from '@/hooks/useCalendarModals';
import { useCalendarViewStore } from '@/store';

Sentry.init({
  dsn: 'https://fc15d194ba82cd269fad099757600f7e@o4509079625662464.ingest.us.sentry.io/4509079639621632',
  tracesSampleRate: 1.0,
  sendDefaultPii: true,
  profilesSampleRate: 1.0,
  environment: 'production',
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.mobileReplayIntegration(),
  ],
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

  // Auto-verify premium status with PocketBase
  usePremiumVerification();

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
        timeoutPromise
      ]);

      await SplashScreen.hideAsync().catch(() => {
      });
    };

    hideSplash();
  }, [loaded]);

  // Move update check to a separate effect to not block initial render
  useEffect(() => {
    if (!loaded || __DEV__) return;

    const checkAndApplyUpdate = async () => {
      try {
        const isEmergencyLaunch = Updates.isEmergencyLaunch;
        
        if (isEmergencyLaunch) {
          if (Platform.OS !== 'web') {
            Alert.alert(
              'Running in Emergency Mode',
              'The app is currently running in emergency recovery mode due to an issue with the latest update. Some features may be limited.',
              [{ text: 'OK' }]
            );
          }
          return; 
        }
        
        const update = await Updates.checkForUpdateAsync();
        
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          
          if (Platform.OS !== 'web') {
            Alert.alert(
              'Update Available', 'A new version is ready. Restart to apply?',
              [
                { text: 'Later', style: 'cancel' },
                { text: 'Restart', onPress: () => Updates.reloadAsync() }
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
    setTimeout(checkAndApplyUpdate, 2500);
    
    // Periodic checks
    const updateInterval = setInterval(checkAndApplyUpdate, 30000);
    
    return () => clearInterval(updateInterval);
  }, [loaded]);


  useEffect(() => {
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleDeepLink({ url: response });
    });
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    const urlSubscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      notificationSubscription.remove();
      urlSubscription.remove();
    };
  }, [handleDeepLink]);

  const hasCompletedOnboarding = useUserStore(state => state.preferences.hasCompletedOnboarding);

  // Initialize premium service
  useEffect(() => {
    if (loaded) {
      initializePremiumService();
    }
  }, [loaded]);

// Enhanced app state change handler 
useEffect(() => {
  if (!loaded) return;

  const handleAppStateChange = async (nextAppState: string) => {
    addSyncLog(`🔄 AppState changed to: ${nextAppState}`, 'info');
    const currentSyncStatus = useRegistryStore.getState().syncStatus;
    const isPremium = useUserStore.getState().preferences.premium === true;
    
    if (currentSyncStatus === 'syncing') {
      addSyncLog(`🔄 Sync already in progress (${currentSyncStatus}), skipping AppState change for ${nextAppState}.`, 'verbose');
      return;
    }

    if (!loaded || !isPremium) return;
    
    try {
      if (nextAppState === 'active') {
        addSyncLog('📥 App resumed – pulling latest snapshot to merge remote changes', 'info');
        await pullLatestSnapshot();
        
        setTimeout(() => {
          useTaskStore.getState().recalculateTodaysTasks();
        }, 500);
        
        addSyncLog('✅ Resume pull completed', 'success');
      } else if (nextAppState === 'background') {
        addSyncLog('📤 App backgrounded – pushing merged snapshot', 'info');
        await pushSnapshot();
        addSyncLog('✅ Background push completed', 'success');
      } else if (nextAppState === 'inactive') {
        addSyncLog('📤 App became inactive – scheduling push with delay', 'info');
        
        // Handle iOS device switching scenario where app stays inactive
        setTimeout(async () => {
          if (AppState.currentState === 'inactive') {
            addSyncLog('📤 Still inactive after delay – pushing snapshot', 'info');
            
            try {
              await pushSnapshot();
              addSyncLog('✅ Inactive push completed', 'success');
            } catch (e: any) {
              useRegistryStore.getState().setSyncStatus('error');
              addSyncLog('❌ Inactive push failed', 'error', e.message);
            } finally {
              useRegistryStore.getState().setSyncStatus('idle');
            }
          } else {
            addSyncLog('📱 App state changed from inactive, skipping delayed push', 'verbose');
          }
        }, 1000);
      }
    } catch (e: any) {
      useRegistryStore.getState().setSyncStatus('error');
      addSyncLog(
        nextAppState === 'active' ? '❌ Resume pull failed' : '❌ Background push failed', 
        'error',
        e.message
      );
    } finally {
      // 4. Always reset sync status
      useRegistryStore.getState().setSyncStatus('idle');
    }
  };
  
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => {
    subscription.remove();
    addSyncLog('🔄 AppState sync handler removed', 'verbose');
  };
}, [loaded]);
  

  if (!loaded) return null;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'dark'}>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <ErrorBoundary>
            <>
              <Stack screenOptions={{ headerShown: false }}>
                {!hasCompletedOnboarding ? (
                  <Stack.Screen  name="screens/onboarding/index" options= {{ gestureEnabled: false }}/>
                ) : (
                  <Stack.Screen  name="(drawer)" />
                )}
              </Stack>
              <Toast/>
              <StatusBar style="auto" />
              <TaskRecommendationModal />
              <EditStockModal />
              <AddStockModal />
              <CalendarModalContainer />
            </>
          </ErrorBoundary>
        </NavigationThemeProvider>
      </TamaguiProvider>
    </QueryClientProvider>
  );
});

function CalendarModalContainer() {
  const { 
    isEventModalVisible, 
    isViewEventModalVisible,
    closeEventModals,
    openEventModal
  } = useCalendarModals();

  const selectedDate = useCalendarViewStore(state => state.selectedDate);
  const selectedEvents = useCalendarViewStore(state => state.selectedEvents);

  const {
    newEventTitle,
    setNewEventTitle,
    newEventTime,
    setNewEventTime,
    selectedType,
    setSelectedType,
    notifyOnDay,
    setNotifyOnDay,
    notifyBefore,
    setNotifyBefore,
    notifyBeforeTime,
    setNotifyBeforeTime,
    editingEvent,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    resetForm,
  } = useCalendarEvents(selectedDate);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { primaryColor } = useUserStore(s => s.preferences);

  return (
    <EventModal
      isEventModalVisible={isEventModalVisible}
      isViewEventModalVisible={isViewEventModalVisible}
      selectedDate={selectedDate}
      selectedEvents={selectedEvents}
      newEventTitle={newEventTitle}
      setNewEventTitle={setNewEventTitle}
      newEventTime={newEventTime}
      setNewEventTime={setNewEventTime}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      notifyOnDay={notifyOnDay}
      setNotifyOnDay={setNotifyOnDay}
      notifyBefore={notifyBefore}
      setNotifyBefore={setNotifyBefore}
      notifyBeforeTime={notifyBeforeTime}
      setNotifyBeforeTime={setNotifyBeforeTime}
      editingEvent={editingEvent}
      handleAddEvent={handleAddEvent}
      handleEditEvent={handleEditEvent}
      handleDeleteEvent={handleDeleteEvent}
      resetForm={resetForm}
      closeEventModals={closeEventModals}
      openEventModal={openEventModal}
      isDark={isDark}
      primaryColor={primaryColor}
    />
  );
}
