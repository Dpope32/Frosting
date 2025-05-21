import React, { useState, useEffect } from 'react';
import { useUserStore, 
  useRegistryStore, 
  useHabitStore,
  useBillStore,
  useCalendarStore, 
  useWallpaperStore,
  useVaultStore, 
  useCustomCategoryStore, 
  useTagStore, 
  useNoteStore, 
  useProjectStore
} from '@/store';
import { useProjectStore as useProjectsStore } from '@/store/ToDo';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { addSyncLog } from '@/components/sync/syncUtils';
import { pullLatestSnapshot } from '@/sync/snapshotPushPull';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  const isPremium = useUserStore((state) => state.preferences.premium === true);
  const calendarPermission = useUserStore((state) => state.preferences.calendarPermission);

  const {  exportStateToFile } = useRegistryStore();
  useAppInitialization();
  useEffect(() => {
    setShowIntro(true);
    const timer = setTimeout(() => setShowIntro(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Sync and export after all persisted stores finish rehydrating
 useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          useUserStore.persist.hasHydrated(),
          useProjectStore.persist.hasHydrated(),
          useProjectsStore.persist.hasHydrated(),
          useHabitStore.persist.hasHydrated(),
          useBillStore.persist.hasHydrated(),
          useCalendarStore.persist.hasHydrated(),
          useWallpaperStore.persist.hasHydrated(),
          useVaultStore.persist.hasHydrated(),
          useCustomCategoryStore.persist.hasHydrated(),
          useTagStore.persist.hasHydrated(),
        ]);
        // Manually load NoteStore
        await useNoteStore.getState().loadNotes();
        
        if (isPremium) {
          addSyncLog('📚 All stores hydrated successfully', 'verbose');
          
          // NOW it's safe to export state and sync
          exportStateToFile();
          
          // After successful hydration, now we can run the sync process
          if (hasCompletedOnboarding) {
            const syncOnStartup = async () => {
              try {
                addSyncLog('🚀 Starting sync after hydration complete', 'info');
                await pullLatestSnapshot();
              } catch (error) {
                console.error('Post-hydration sync failed:', error);
                addSyncLog(
                  '🔥 Post-hydration sync failed',
                  'error',
                  error instanceof Error ? error.message : String(error)
                );
              }
            };
            syncOnStartup();
          }
        }
      } catch (error) {
        if (isPremium) {
          console.error('Sync/export failed:', error);
          addSyncLog('❌ Store hydration failed', 'error', 
            error instanceof Error ? error.message : String(error));
        }
      }
    })();
  }, [hasCompletedOnboarding, isPremium]);

  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  
  return <Redirect href="/(drawer)/(tabs)" />;
}
