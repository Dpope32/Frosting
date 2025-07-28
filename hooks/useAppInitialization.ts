import { useCalendarStore, useWallpaperStore } from '@/store';
import { useNBAStore } from '@/store/NBAStore';
import { preloadTheme } from '@/utils';
import * as Sentry from '@sentry/react-native';
import { useEffect } from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ColorSchemeName } from 'react-native';

export function useAppInitialization() {
  // Get the system theme using the hook properly at the top level
  const systemColorScheme = useColorScheme();
  // Initialize NFL and NBA schedules
  // TODO: add NFL schedule with NBA szn coming to an end
  //useSportsAPI();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Run critical operations in parallel with a timeout
        const criticalInitPromise = Promise.all([
          preloadTheme(systemColorScheme as ColorSchemeName),
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
            // Clean up any residual NBA data and tasks (season ended)
            useNBAStore.getState().clearAllNBAData(),
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
