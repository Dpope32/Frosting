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
      
      addSyncLog(`📚 All stores hydrated in ${hydrationDuration}ms (${(hydrationDuration/1000).toFixed(1)}s)`, 'verbose');
      if (Platform.OS === 'android') {
        addSyncLog(`🤖 Android navigation bar hidden + system UI background set btw`, 'verbose');
      }
  
      if (!premium) {
        const totalTime = Date.now() - overallStartTime;
        addSyncLog(`⚡ App ready for non-premium user in ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`, 'info');
        return;
      }                                       
      
      // Start tracking initial sync for premium users
      startInitialSync();
      
      // Export phase timing
      const exportStartTime = Date.now();
      const state = getAllStoreStates();
      await exportEncryptedState(state);
      const exportEndTime = Date.now();
      const exportDuration = exportEndTime - exportStartTime;
      addSyncLog(`💾 Export phase completed in ${exportDuration}ms (${(exportDuration/1000).toFixed(1)}s)`, 'info');
  
      if (finishedOnboarding) {
        // Pull phase timing
        const pullStartTime = Date.now();
        await pullLatestSnapshot();
        const pullEndTime = Date.now();
        const pullDuration = pullEndTime - pullStartTime;
        
        const platformEmoji = Platform.OS === 'android' ? '🤖' : Platform.OS === 'ios' ? '🍎' : Platform.OS === 'web' ? '🌐' : '📱';
        addSyncLog(`📥 ${platformEmoji} Pull phase completed in ${pullDuration}ms (${(pullDuration/1000).toFixed(1)}s)`, 'success');
        
        // Total timing breakdown
        const totalTime = Date.now() - overallStartTime;
        const syncTime = totalTime - hydrationDuration;
        addSyncLog(`⚡ App startup breakdown: Hydration=${hydrationDuration}ms, Sync=${syncTime}ms, Total=${totalTime}ms`, 'info');
        
        // Complete initial sync tracking and show toast
        completeInitialSync();
        useToastStore.getState().showToast('Synced with workspace', 'success');
      } else {
        // Complete initial sync even if onboarding not finished
        completeInitialSync();
        const totalTime = Date.now() - overallStartTime;
        addSyncLog(`⚡ App ready (onboarding pending) in ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`, 'info');
      }
    })().catch(e => {
      // Make sure to complete sync tracking even on error
      completeInitialSync();
      const totalTime = Date.now() - overallStartTime;
      addSyncLog(`🔥 Startup sync failed after ${totalTime}ms: ${e?.message || String(e)}`, 'error');
    });
  }, [premium, finishedOnboarding]);

  if (!finishedOnboarding) return <Redirect href="/screens/onboarding" />;
  return <Redirect href="/(drawer)/(tabs)" />;
}