import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/store/UserStore';
import { Redirect } from 'expo-router';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useRegistryStore } from '@/store/RegistryStore';
import { useProjectStore } from '@/store/ToDo';
import { useProjectStore as useProjectsStore } from '@/store/ProjectStore';
import { useHabitStore } from '@/store/HabitStore';
import { useBillStore } from '@/store/BillStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { useWallpaperStore } from '@/store/WallpaperStore';
import { useVaultStore } from '@/store/VaultStore';
import { useCustomCategoryStore } from '@/store/CustomCategoryStore';
import { useTagStore } from '@/store/TagStore';
import { useNoteStore } from '@/store/NoteStore';

export default function Index() {
  const [showIntro, setShowIntro] = useState(true);
  const hasCompletedOnboarding = useUserStore((state) => state.preferences.hasCompletedOnboarding);
  const isPremium = useUserStore((state) => state.preferences.premium === true);
  
  // Grab sync and export actions
  const { logSyncStatus, exportStateToFile } = useRegistryStore();
  // Call app initialization hook at the top level (per React rules)
  useAppInitialization();
  useEffect(() => {
    if (hasCompletedOnboarding && isPremium) {
      logSyncStatus();
      exportStateToFile();
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
        
        // Only log sync status and export if onboarding is completed and user is premium
        if (hasCompletedOnboarding && isPremium) {
          logSyncStatus();
          await exportStateToFile();
        }
      } catch (error) {
        if (isPremium) {
          console.error('Sync/export failed:', error);
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
