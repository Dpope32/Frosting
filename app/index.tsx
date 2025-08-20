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
      
      const exportStartTime = Date.now();
      const state = getAllStoreStates();
      await exportEncryptedState(state);
       // this is where i will add the option for users to skip the sync on the sync rendering screen
  
      const exportEndTime = Date.now();
      const exportDuration = exportEndTime - exportStartTime;
              addSyncLog(`💾 Export phase completed in ${(exportDuration/1000).toFixed(1)}s`, 'info');
  
      if (finishedOnboarding) {
        // 🚀 GIT-LIKE CHECK: Skip entire sync if this device was the last to update
        const checkStartTime = Date.now();
        const isAlreadyUpToDate = await checkIfAlreadyUpToDate();
        const checkDuration = Date.now() - checkStartTime;
        
        if (isAlreadyUpToDate) {
          // Skip all network operations - this device already has the latest data
          const totalTime = Date.now() - overallStartTime;
          addSyncLog(`⚡ Quick startup (already up to date): ${(totalTime/1000).toFixed(1)}s (${checkDuration}ms check)`, 'success');
          completeInitialSync();
          useToastStore.getState().showToast('Already up to date', 'success');
          return; // Exit early, skip pull/push entirely
        }
        
        // DIFFERENT DEVICE: Full sync required
        addSyncLog(`🔄 Running full sync (different device)`, 'info');
        
        // Pull phase timing - GET OTHER DEVICES' DATA FIRST
        const pullStartTime = Date.now();
        await pullLatestSnapshot();
        const pullEndTime = Date.now();
        const pullDuration = pullEndTime - pullStartTime;
        
        const platformEmoji = Platform.OS === 'android' ? '🤖' : Platform.OS === 'ios' ? '🍎' : Platform.OS === 'web' ? '🌐' : '📱';
        addSyncLog(`📥 ${platformEmoji} Pull phase completed in ${(pullDuration/1000).toFixed(1)}s - got remote data first`, 'info');
        
        // Push phase timing - PUSH MERGED DATA (local + remote)
        const pushStartTime = Date.now();
        const { pushSnapshot } = await import('@/sync/snapshotPushPull');
        await pushSnapshot();
        const pushEndTime = Date.now();
        const pushDuration = pushEndTime - pushStartTime;
        const totalTime = Date.now() - overallStartTime;
        const timeOnPocketbase = pullDuration + pushDuration;
        addSyncLog(` App startup breakdown: Push time = ${(pushDuration/1000).toFixed(1)}s, Hydration=${(hydrationDuration/1000).toFixed(1)}s, Pull=${(pullDuration/1000).toFixed(1)}s, Total=${(totalTime/1000).toFixed(1)}s`, 'info');
        if(timeOnPocketbase > 20000) {
          addSyncLog(`shits slow asf yo`, 'warning');
        }
        completeInitialSync();
        useToastStore.getState().showToast('Synced with workspace', 'success');
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