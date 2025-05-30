// app/index.tsx  ← single source of truth for first-run sync
import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  useUserStore,
  useRegistryStore,
  useHabitStore,
  useBillStore,
  useCalendarStore,
  useWallpaperStore,
  useVaultStore,
  useCustomCategoryStore,
  useTagStore,
  useNoteStore,
  useToastStore,
} from '@/store';
import { useProjectStore as useTasks } from '@/store/ToDo';
import { useProjectStore as useProjects } from '@/store/ProjectStore';
import { pullLatestSnapshot, pushSnapshot } from '@/sync/snapshotPushPull';
import { exportEncryptedState } from '@/sync/registrySyncManager';
import { addSyncLog } from '@/components/sync/syncUtils';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function Index() {
  const [intro, setIntro] = useState(true);
  const { preferences } = useUserStore.getState();
  const finishedOnboarding = preferences.hasCompletedOnboarding;
  const premium = preferences.premium === true;
  const colorScheme = useColorScheme();
  
  // Hide navigation bar on Android only - run immediately
  if (Platform.OS === 'android') {
    NavigationBar.setVisibilityAsync("hidden");
  }

  // Set system UI background colors to match Header (Android only)
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backgroundColor = colorScheme === 'dark' ? '#0e0e0f' : '#ffffff';
      SystemUI.setBackgroundColorAsync(backgroundColor);
    }
  }, [colorScheme]);

  const { getAllStoreStates } = useRegistryStore.getState();

  useAppInitialization();

  // dismiss splash card in ½ s
  useEffect(() => {
    const t = setTimeout(() => setIntro(false), 500);
    return () => clearTimeout(t);
  }, []);

  // full-store hydration → export → pull once
  useEffect(() => {
    (async () => {
      await Promise.all([
        useUserStore.persist.hasHydrated(),
        useTasks.persist.hasHydrated(),
        useProjects.persist.hasHydrated(),
        useHabitStore.persist.hasHydrated(),
        useBillStore.persist.hasHydrated(),
        useCalendarStore.persist.hasHydrated(),
        useWallpaperStore.persist.hasHydrated(),
        useVaultStore.persist.hasHydrated(),
        useCustomCategoryStore.persist.hasHydrated(),
        useTagStore.persist.hasHydrated(),
      ]);
      await useNoteStore.getState().loadNotes();

      if (!premium) return;                                       
      addSyncLog('📚 All stores hydrated (in app/index.tsx) with local cache', 'verbose');
      
      // Export state locally
      const state = getAllStoreStates();
      await exportEncryptedState(state);
  
      if (finishedOnboarding) {
        // First pull latest
        await pullLatestSnapshot();
        addSyncLog(`📥 Latest snapshot pulled successfully`, 'success');
        
        // Then push any local changes that might have happened while offline
        await pushSnapshot();
        addSyncLog(`📤 Local changes pushed to workspace`, 'success');
        
        useToastStore.getState().showToast('Synced with workspace', 'success');
      }
    })().catch(e =>
      addSyncLog('🔥 startup sync failed', 'error', e?.message || String(e))
    );
  }, [premium, finishedOnboarding]);

  if (!finishedOnboarding) return <Redirect href="/screens/onboarding" />;
  return <Redirect href="/(drawer)/(tabs)" />;
}
