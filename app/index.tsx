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
      
      addSyncLog(` All local stores hydrated in ${(hydrationDuration/1000).toFixed(1)}s`, 'verbose');
      if (Platform.OS === 'android') {
        addSyncLog(`🤖 Android navigation bar hidden + system UI background set btw`, 'verbose');
      }

      if (!premium) {
        const totalTime = Date.now() - overallStartTime;
        addSyncLog(`⚡ App ready for non-premium user in ${(totalTime/1000).toFixed(1)}s`, 'info');
        return;
      }                                      
      startInitialSync();
      const exportStartTime = Date.now();
      const state = getAllStoreStates();
      const getAllStoreStatesTime = Date.now();
      addSyncLog(`💾 getAllStoreStates took ${(getAllStoreStatesTime - exportStartTime)/1000}s`, 'info');
      await exportEncryptedState(state);
       // this is where i will add the option for users to skip the sync on the sync rendering screen
  
      const exportEndTime = Date.now();
      const exportDuration = exportEndTime - exportStartTime;
              addSyncLog(`💾 Export phase completed in ${(exportDuration/1000).toFixed(1)}s`, 'info');
  
      if (finishedOnboarding) {
        // CRITICAL FIX: Pull first to get other devices' data, then push merged result
        // This fixes the circular self-sync bug where each device was only syncing with itself
        
        // Pull phase timing - GET OTHER DEVICES' DATA FIRST
        const pullStartTime = Date.now();
        await pullLatestSnapshot();
        const pullEndTime = Date.now();
        const pullDuration = pullEndTime - pullStartTime;
        
        const platformEmoji = Platform.OS === 'android' ? '🤖' : Platform.OS === 'ios' ? '🍎' : Platform.OS === 'web' ? '🌐' : '📱';
        addSyncLog(`📥 ${platformEmoji} Pull phase completed in ${(pullDuration/1000).toFixed(1)}s - got remote data first`, 'success');
        
        // Push phase timing - PUSH MERGED DATA (local + remote)
        const pushStartTime = Date.now();
        const { pushSnapshot } = await import('@/sync/snapshotPushPull');
        await pushSnapshot();
        const pushEndTime = Date.now();
        const pushDuration = pushEndTime - pushStartTime;
        addSyncLog(`📤 Push phase completed in ${(pushDuration/1000).toFixed(1)}s source: app/index.tsx - pushed merged data`, 'success');
        
        // Total timing breakdown
        const totalTime = Date.now() - overallStartTime;
        const syncTime = totalTime - hydrationDuration;
        addSyncLog(`⚡ App startup breakdown: Hydration=${(hydrationDuration/1000).toFixed(1)}s, Sync=${(syncTime/1000).toFixed(1)}s, Total=${(totalTime/1000).toFixed(1)}s`, 'info');
        
        // Complete initial sync tracking and show toast
        completeInitialSync();
        useToastStore.getState().showToast('Synced with workspace', 'success');
      } else {
        // Complete initial sync even if onboarding not finished
        completeInitialSync();
        const totalTime = Date.now() - overallStartTime;
        addSyncLog(`⚡ App ready (onboarding pending) in ${(totalTime/1000).toFixed(1)}s`, 'info');
      }
    })().catch(e => {
      // Make sure to complete sync tracking even on error
      completeInitialSync();
      const totalTime = Date.now() - overallStartTime;
      addSyncLog(`🔥 Startup sync failed after ${(totalTime/1000).toFixed(1)}s: ${e?.message || String(e)}`, 'error');
    });
  }, [premium, finishedOnboarding]);

  if (!finishedOnboarding) return <Redirect href="/screens/onboarding" />;
  return <Redirect href="/(drawer)/(tabs)" />;
}