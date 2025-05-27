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
import { pullLatestSnapshot } from '@/sync/snapshotPushPull';
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
      if (Platform.OS === 'android') {
        addSyncLog(`🤖 Android navigation bar hidden + system UI background set btw`, 'verbose');
      }
      // one-shot export
      const state = getAllStoreStates();
      await exportEncryptedState(state);
      //addSyncLog('🔐 stateSnapshot.enc exported (in app/index) to File System ', 'success');

      if (finishedOnboarding) {
        await pullLatestSnapshot();
        const platformEmoji = Platform.OS === 'android' ? '🤖' : Platform.OS === 'ios' ? '🍎' : Platform.OS === 'web' ? '🌐' : '📱';
        addSyncLog(`📥 ${platformEmoji} Latest snapshot pulled successfully on ${Platform.OS} within the index.tsx`, 'success');
        useToastStore.getState().showToast('Pulled latest data from workspace', 'success');
      }
    })().catch(e =>
      addSyncLog('🔥 startup sync failed', 'error', e?.message || String(e))
    );
  }, [premium, finishedOnboarding]);

  if (!finishedOnboarding) return <Redirect href="/screens/onboarding" />;
  return <Redirect href="/(drawer)/(tabs)" />;
}
