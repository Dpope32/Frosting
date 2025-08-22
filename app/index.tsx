// app/index.tsx - Enhanced version with initial sync tracking

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
import { checkIfAlreadyUpToDate } from '@/services/syncServices';

export default function Index() {
  const [intro, setIntro] = useState(true);
  const { preferences } = useUserStore.getState();
  const finishedOnboarding = preferences.hasCompletedOnboarding;
  const premium = preferences.premium === true;
  const colorScheme = useColorScheme();
  
  if (Platform.OS === 'android') NavigationBar.setVisibilityAsync("hidden");
  useEffect(() => {
    if (Platform.OS === 'android') SystemUI.setBackgroundColorAsync(colorScheme === 'dark' ? '#0e0e0f' : '#ffffff');
  }, [colorScheme]);

  const { getAllStoreStates, startInitialSync, completeInitialSync } = useRegistryStore.getState();
  const overallStartTime = Date.now();
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

      const hydrationTime = Date.now();
      const hydrationDuration = hydrationTime - overallStartTime; 

      if (!premium) return;                                      
      startInitialSync();
      
      // 🧹 ONE-TIME CLEANUP: Remove duplicates BEFORE export captures state
      const cleanupStart = Date.now();
      await useCalendarStore.getState().cleanupServerSnapshot();
      const cleanupDuration = Date.now() - cleanupStart;
      addSyncLog(`🧹 Pre-export cleanup completed`, 'success');
      
      let precheckDuration = 0;
      if (finishedOnboarding) {
        // 🚀 CHECK SAME DEVICE FIRST - before expensive export
        const checkStartTime = Date.now();
        const isAlreadyUpToDate = await checkIfAlreadyUpToDate();
        precheckDuration = Date.now() - checkStartTime;
        
        if (isAlreadyUpToDate) {
          const totalTime = Date.now() - overallStartTime;
          addSyncLog(`⚡ Same device detected - skipping export and sync: ${(totalTime/1000).toFixed(1)}s (${precheckDuration}ms check)`, 'success');
          completeInitialSync();
          useToastStore.getState().showToast('Already up to date', 'success');
          return; // Skip export entirely
        }
        
        addSyncLog(`New Data detected on server, syncing...`, 'info');
      }
      
      // Only export if different device or no onboarding
      const exportStartTime = Date.now();
      const state = getAllStoreStates();
      await exportEncryptedState(state);
      const exportEndTime = Date.now();
      const exportDuration = exportEndTime - exportStartTime;
      addSyncLog(`💾 Export phase completed in ${(exportDuration/1000).toFixed(1)}s`, 'info');

      if (finishedOnboarding) {
        const pullStartTime = Date.now();
        await pullLatestSnapshot();
        const pullEndTime = Date.now();
        const pullDuration = pullEndTime - pullStartTime;
        const pushStartTime = Date.now();

        const { pushSnapshot } = await import('@/sync/snapshotPushPull');
        await pushSnapshot();
        const pushEndTime = Date.now();
        const pushDuration = pushEndTime - pushStartTime;
        const totalTime = Date.now() - overallStartTime;

        const s = (ms: number) => (ms/1000).toFixed(1);
        const sumMs = pushDuration + pullDuration + hydrationDuration + exportDuration + cleanupDuration + precheckDuration;
        const otherMs = Math.max(0, totalTime - sumMs);
        addSyncLog(
          `App startup breakdown: Hydration=${s(hydrationDuration)}s, Pre-cleanup=${s(cleanupDuration)}s, Pre-check=${s(precheckDuration)}s, Export=${s(exportDuration)}s, Pull=${s(pullDuration)}s, Push=${s(pushDuration)}s, Other=${s(otherMs)}s, Total=${s(totalTime)}s`,
          'info'
        );
        completeInitialSync();
        useToastStore.getState().showToast('Welcome back!', 'success');
      } else {
        completeInitialSync();
      }
    })().catch(e => {
      completeInitialSync();
      const totalTime = Date.now() - overallStartTime;
      addSyncLog(`🔥 Startup sync failed after ${(totalTime/1000).toFixed(1)}s: ${e?.message || String(e)}`, 'error');
    });
  }, [premium, finishedOnboarding]);

  if (!finishedOnboarding) return <Redirect href="/screens/onboarding" />;
  return <Redirect href="/(drawer)/(tabs)" />;
}