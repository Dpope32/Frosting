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
import { exportEncryptedState } from '@/sync/registrySyncManager';
import { pullLatestSnapshot, pushSnapshot } from '@/sync/snapshotPushPull';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  const isPremium = useUserStore((state) => state.preferences.premium === true);
  
  // Grab sync and export actions
  const { logSyncStatus, exportStateToFile } = useRegistryStore();
  // Call app initialization hook at the top level (per React rules)
  useAppInitialization();
  
  // Initial sync on app startup for premium users - ONLY after hydration is complete
  useEffect(() => {
    if (hasCompletedOnboarding && isPremium) {
      // Log status but DO NOT export state until after hydration
      logSyncStatus();
      
      // We don't call syncOnStartup here anymore - wait for hydration
    }
  }, [hasCompletedOnboarding, isPremium]);
  
  // Initial intro timer
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
                
                // Access sync modules from the global scope (imported in _layout.tsx)
                
                // Pull first to get latest data
                addSyncLog('📥 Post-hydration sync: Pulling latest snapshot', 'info');
                await pullLatestSnapshot();
                addSyncLog('✅ Post-hydration sync: Pull completed', 'success');
                
                // Then prepare and push any local changes
                addSyncLog('🗄️ Post-hydration sync: Exporting state', 'info');
                const allStates = useRegistryStore.getState().getAllStoreStates();
                
                // Verify we have store data before exporting
                const storeKeys = Object.keys(allStates);
                if (storeKeys.length === 0) {
                  addSyncLog('⚠️ No store states found to export', 'warning');
                  return;
                }
                
                await exportEncryptedState(allStates);
                addSyncLog('🔐 Post-hydration sync: State encrypted', 'success');
                
                addSyncLog('📤 Post-hydration sync: Pushing snapshot', 'info');
                await pushSnapshot();
                addSyncLog('✅ Post-hydration sync: Push completed', 'success');
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

  
  // If onboarding is not completed, go to onboarding
  if (!hasCompletedOnboarding) {
    return <Redirect href="/screens/onboarding" />;
  }
  
  // If onboarding is completed, go to drawer tabs layout
  return <Redirect href="/(drawer)/(tabs)" />;
}
