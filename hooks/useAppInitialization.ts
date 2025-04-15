import { useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { useCalendarStore } from '@/store/CalendarStore';
import { useNBAStore } from '@/store/NBAStore';
import { useSportsAPI } from './useSportsAPI';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useWallpaperStore } from '@/store/WallpaperStore';
import { preloadTheme } from '@/utils/preloadTheme';

export function useAppInitialization() {
  // Get the system theme using the hook properly at the top level
  const systemColorScheme = useRNColorScheme();
  // Initialize NFL and NBA schedules
  // TODO: add NFL schedule with NBA szn coming to an end
  useSportsAPI();
  useEffect(() => {
    const initializeApp = async () => {
      // Pre-load the theme to prevent theme bounce
      // Pass the systemColorScheme to the function instead of calling the hook inside
      await preloadTheme(systemColorScheme);
      try {
        await useWallpaperStore.getState().checkAndRedownloadWallpapers();
      } catch (error) {
        Sentry.captureException(error, {
          extra: {
            operation: 'useAppInitialization_checkAndRedownloadWallpapers',
          },
        });
      }
    };
    initializeApp();
  }, [systemColorScheme]); 

  // TODO do not sync API if disabled in Settings
  useEffect(() => {
    useNBAStore.getState().syncNBAGames();
    useNBAStore.getState().syncGameTasks();
    useCalendarStore.getState().syncBirthdays();
  }, []);
}
