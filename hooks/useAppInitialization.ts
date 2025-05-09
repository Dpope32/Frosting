import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useCalendarStore } from '@/store/CalendarStore';
//import { useNBAStore } from '@/store/NBAStore';
//import { useSportsAPI } from './useSportsAPI';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useWallpaperStore } from '@/store/WallpaperStore';
import { preloadTheme } from '@/utils/preloadTheme';

export function useAppInitialization() {
  // Get the system theme using the hook properly at the top level
  const systemColorScheme = useRNColorScheme();
  // Initialize NFL and NBA schedules
  // TODO: add NFL schedule with NBA szn coming to an end
  //useSportsAPI();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run critical operations in parallel with a timeout
        const criticalInitPromise = Promise.all([
          preloadTheme(systemColorScheme),
          // Add other critical initialization here
        ]);
        
        // Set a timeout for critical operations
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Critical initialization timeout')), 1000);
        });
        
        // Race between critical operations and timeout
        await Promise.race([criticalInitPromise, timeoutPromise])
          .catch(error => {
            console.warn('Critical initialization timed out or failed:', error);
            Sentry.captureException(error, {
              extra: {
                operation: 'useAppInitialization_critical_timeout',
              },
            });
          });

        // Defer non-critical operations
        setTimeout(() => {
          Promise.allSettled([
            useWallpaperStore.getState().checkAndRedownloadWallpapers(),
          //  useNBAStore.getState().syncNBAGames(),
          //  useNBAStore.getState().syncGameTasks(),
          () => setTimeout(() => useCalendarStore.getState().syncBirthdays(), 100),
          ]).catch(error => {
            Sentry.captureException(error, {
              extra: {
                operation: 'useAppInitialization_deferred',
              },
            });
          });
        }, 1000); 
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            operation: 'useAppInitialization_critical',
          },
        });
      }
    };

    initializeApp();
  }, [systemColorScheme]);
}
