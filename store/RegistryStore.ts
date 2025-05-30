import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { exportEncryptedState } from '@/sync';
import { debounce } from 'lodash';
import { format } from 'date-fns';

// Import all stores
import { useHabitStore } from './HabitStore';
import { useBillStore } from './BillStore';
import { useCalendarStore } from './CalendarStore';
import { useProjectStore as useTaskStore } from './ToDo';
import { useUserStore } from './UserStore';
import { useVaultStore } from './VaultStore';
import { usePeopleStore } from './People';
import { useCustomCategoryStore } from './CustomCategoryStore';
import { useTagStore } from './TagStore';
import { useProjectStore } from './ProjectStore';
import { addSyncLog } from '@/components/sync/syncUtils';

interface RegistryState {
  hasCompletedOnboarding: boolean;
  isFirstLaunch: boolean;
  lastSyncAttempt: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  notificationStatus: 'granted' | 'denied' | 'unavailable';
  stocksLastUpdated: number;
  workspaceId?: string | null;
  
  // NEW: Initial sync tracking
  isInitialSyncInProgress: boolean;
  initialSyncStartTime: number | null;

  setHasCompletedOnboarding: (value: boolean) => void;
  setIsFirstLaunch: (value: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setNotificationStatus: (status: 'granted' | 'denied' | 'unavailable') => void;
  setStocksLastUpdated: (timestamp: number) => void;
  checkNotificationStatus: () => void; 
  getAllStoreStates: () => Record<string, any>;
  hydrateAll: (data: Record<string, any>) => void;
  syncOnboardingWithUser: () => void;
  setWorkspaceId: (id: string | null) => void;
  
  // NEW: Initial sync methods
  startInitialSync: () => void;
  completeInitialSync: () => void;
}


export const useRegistryStore = create<RegistryState>((set, get) => {
  // Create the debounced notification check function outside the store properties
  const debouncedCheck = debounce(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      set({ notificationStatus: status === 'granted' ? 'granted' : 'denied' });
    } catch {
      set({ notificationStatus: 'unavailable' });
    }
  }, 1000);
  
  return {
    hasCompletedOnboarding: false,
    isFirstLaunch: true,
    lastSyncAttempt: Date.now(),
    syncStatus: 'idle',
    notificationStatus: 'unavailable',
    isInitialSyncInProgress: false,
    initialSyncStartTime: null,
    stocksLastUpdated: 0,
    workspaceId: null,
    setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
    setIsFirstLaunch: (value) => set({ isFirstLaunch: value }),
    setSyncStatus: (status) => set({ syncStatus: status }),
    setNotificationStatus: (status) => set({ notificationStatus: status }),
    setStocksLastUpdated: (timestamp) => set({ stocksLastUpdated: timestamp }),
    setWorkspaceId: (id) => {
      set({ workspaceId: id });
      if (id) {
        addSyncLog(`Workspace ID set: ${id}`, 'info');
      } else {
        addSyncLog('Workspace ID cleared', 'info');
      }
      
      setTimeout(() => {
        set({ syncStatus: 'idle' });
      }, 50);
    },

    // Fixed debounced notification check
    checkNotificationStatus: () => {
      debouncedCheck();
    },

    getAllStoreStates: () => {
      const now = Date.now();
      const billStoreFullState = useBillStore.getState();
      let billStateForSnapshot: any = { isSyncEnabled: billStoreFullState.isSyncEnabled };
      if (billStoreFullState.isSyncEnabled) {
        billStateForSnapshot.bills = billStoreFullState.bills;
        billStateForSnapshot.monthlyIncome = billStoreFullState.monthlyIncome;
        billStateForSnapshot.lastUpdated = now;
       // addSyncLog(`[Snapshot] Bills sync ON: Including ${Object.keys(billStoreFullState.bills || {}).length} bills, income ${billStoreFullState.monthlyIncome}.`, 'info');
      } else {
        addSyncLog('[Snapshot] Bills sync OFF: Excluding bills and income.', 'info');
      }
      const vaultStoreFullState = useVaultStore.getState();
      let vaultStateForSnapshot: any = { isSyncEnabled: vaultStoreFullState.isSyncEnabled };
      if (vaultStoreFullState.isSyncEnabled) {
        vaultStateForSnapshot.vaultData = vaultStoreFullState.vaultData;
        vaultStateForSnapshot.lastUpdated = now;
    //    addSyncLog(`[Snapshot] Passwords (Vault) sync ON: Including ${vaultStoreFullState.vaultData?.items?.length || 0} items.`, 'info');
      } else {
        addSyncLog('[Snapshot] Passwords (Vault) sync OFF: Excluding vault items.', 'info');
      }
      const projectStoreFullState = useProjectStore.getState();
      let projectStateForSnapshot: any = { isSyncEnabled: projectStoreFullState.isSyncEnabled };
      if (projectStoreFullState.isSyncEnabled) {
        projectStateForSnapshot.projects = projectStoreFullState.projects;
        projectStateForSnapshot.lastUpdated = now;
     //   addSyncLog(`[Snapshot] Projects sync ON: Including ${projectStoreFullState.projects?.length || 0} projects.`, 'info');
      } else {
        addSyncLog('[Snapshot] Projects sync OFF: Excluding projects.', 'info');
      }
      const peopleStoreFullState = usePeopleStore.getState();
      let peopleStateForSnapshot: any = { isSyncEnabled: peopleStoreFullState.isSyncEnabled };
      if (peopleStoreFullState.isSyncEnabled) {
        peopleStateForSnapshot.contacts = peopleStoreFullState.contacts;
        peopleStateForSnapshot.lastUpdated = now;
   //     addSyncLog(`[Snapshot] People (Contacts) sync ON: Including ${Object.keys(peopleStoreFullState.contacts || {}).length} contacts.`, 'info');
      } else {
        addSyncLog('[Snapshot] People (Contacts) sync OFF: Excluding contacts.', 'info');
      }
      const habitStoreFullState = useHabitStore.getState();
      let habitStateForSnapshot: any = { isSyncEnabled: habitStoreFullState.isSyncEnabled };
      if (habitStoreFullState.isSyncEnabled) {
        habitStateForSnapshot.habits = habitStoreFullState.habits;
        habitStateForSnapshot.lastUpdated = now;
     //   addSyncLog(`[Snapshot] Habits sync ON: Including ${Object.keys(habitStoreFullState.habits || {}).length} habits.`, 'info');
      } else {
        addSyncLog('[Snapshot] Habits sync OFF: Excluding habits.', 'info');
      }
      const calendarStoreFullState = useCalendarStore.getState();
      let calendarStateForSnapshot: any = { isSyncEnabled: calendarStoreFullState.isSyncEnabled };
      if (calendarStoreFullState.isSyncEnabled) {
        calendarStateForSnapshot.events = calendarStoreFullState.events;
        calendarStateForSnapshot.lastUpdated = now;
      //  addSyncLog(`[Snapshot] Calendar sync ON: Including ${calendarStoreFullState.events?.length || 0} events.`, 'info');
      } else {
        addSyncLog('[Snapshot] Calendar sync OFF: Excluding calendar events.', 'info');
      }

      // For stores that sync automatically (like CustomCategory and Tags as per user request)
      const customCategoryState = { ...useCustomCategoryStore.getState(), lastUpdated: now };
      const tagsState = { ...useTagStore.getState(), lastUpdated: now };
      // For ToDos in the Task store, we handle this in the Task store hydrateFromSync function
     // addSyncLog('[Snapshot] CustomCategoryStore & TagStore: Syncing automatically (full data). ALWAYS ON ' + 'pulled ' + tagsState.tags.length + ' tags and ' + customCategoryState.categories.length + ' custom categories', 'info',);
      return {
        habits: habitStateForSnapshot,
        bills: billStateForSnapshot, 
        calendar: calendarStateForSnapshot,
        tasks: (() => {
          const taskState = useTaskStore.getState();
          const today = format(new Date(), 'yyyy-MM-dd');
          const tasksWithCompletion = Object.entries(taskState.tasks)
            .filter(([_, task]) => task.completionHistory[today])
            .map(([id, task]) => `${task.name.slice(0, 20)}(${id.slice(-6)}):${task.completionHistory[today]}`);
          
          if (tasksWithCompletion.length > 0) {
            addSyncLog(
              `[SNAPSHOT EXPORT] ${tasksWithCompletion.length} tasks with completion history for ${today}`,
              'info',
              tasksWithCompletion.slice(0, 5).join(', ') + (tasksWithCompletion.length > 5 ? '...' : '')
            );
          } else {
            addSyncLog(`[SNAPSHOT EXPORT] No tasks have completion history for ${today}`, 'warning');
          }
          
          return { ...taskState, lastUpdated: now };
        })(),
        notes: { sync_disabled: true, local_only: true, lastUpdated: now }, 
        user: { sync_disabled: true, lastUpdated: now }, 
        vault: vaultStateForSnapshot, 
        crm: { sync_disabled: true, ui_store: true, lastUpdated: now },
        people: peopleStateForSnapshot, 
        customCategory: customCategoryState, 
        tags: tagsState, 
        projects: projectStateForSnapshot, 
        wallpaper: { sync_disabled: true, local_cache_only: true, lastUpdated: now },
      };
    },
    startInitialSync: () => {
      const startTime = Date.now();
      addSyncLog('🚀 Starting initial sync for premium user', 'info');
      set({ 
        isInitialSyncInProgress: true, 
        initialSyncStartTime: startTime 
      });
    },
    
    completeInitialSync: () => {
      const { initialSyncStartTime } = get();
      const endTime = Date.now();
      const duration = initialSyncStartTime ? endTime - initialSyncStartTime : 0;
      
      addSyncLog(`✅ Initial sync completed in ${duration}ms (${(duration/1000).toFixed(1)}s)`, 'success');
      set({ 
        isInitialSyncInProgress: false, 
        initialSyncStartTime: null 
      });
    },
    
    syncOnboardingWithUser: () => {
      // Keep registry and user store onboarding flags in sync
      const userOnboarding = useUserStore.getState().preferences.hasCompletedOnboarding;
      set({ hasCompletedOnboarding: userOnboarding });
    },
    hydrateAll: (data: Record<string, any>) => {
      const isPremium = useUserStore.getState().preferences.premium === true;
      if (!isPremium) return;
      addSyncLog('🔄 Hydrating stores', 'info');
      if (!data || typeof data !== 'object') {
        addSyncLog('❌ Invalid data for hydration', 'error');
        return;
      }

      // Explicitly delete data for stores that should NEVER be hydrated from sync
      // User store holds the username, pfp, and other user-specific data that should not be synced. Encryption and decryption does not currently work with images
      // So any store with images or user-specific data should not be hydrated from sync (user, wallpaper, notes)
      // Project store holds images as well, this will be the next starting point for when I work on image sync. 
      if (data.user) {
        //addSyncLog('[Hydrate] UserStore: Data found in snapshot, explicitly DELETING and SKIPPING hydration.', 'warning');
        delete data.user;
      }
      if (data.notes) {
        //addSyncLog('[Hydrate] NoteStore: Data found in snapshot, explicitly DELETING and SKIPPING hydration (local-only store).', 'warning');
        delete data.notes;
      }
      if (data.wallpaper) {
        //addSyncLog('[Hydrate] WallpaperStore: Data found in snapshot, explicitly DELETING and SKIPPING hydration (local-cache-only store).', 'warning');
        delete data.wallpaper;
      }
  
      let successCount = 0;
      let errorCount = 0;
  
      const tryHydrateStore = (storeName: keyof typeof data, store: any, storeKeyForLog: string, isAlwaysSynced: boolean = false) => {
        const storeDataFromSnapshot = data[storeName];
        if (storeDataFromSnapshot) {
          try {
            if (!isAlwaysSynced && typeof storeDataFromSnapshot.isSyncEnabled === 'boolean' && !storeDataFromSnapshot.isSyncEnabled) {
              addSyncLog(`[Hydrate] ${storeKeyForLog}: Incoming snapshot data for this store has sync OFF by sender. Skipping hydration.`, 'warning');
              return; 
            }
            const storeState = store.getState();
            if (storeState.hydrateFromSync && typeof storeState.hydrateFromSync === 'function') {
              if (!isAlwaysSynced && typeof storeState.isSyncEnabled === 'boolean' && !storeState.isSyncEnabled) {
             //   addSyncLog(`[Hydrate] ${storeKeyForLog}: Local sync is OFF. Skipping hydration.`, 'info');
              } else {
                storeState.hydrateFromSync(storeDataFromSnapshot);
              }
            } else {
              if (isAlwaysSynced || typeof storeDataFromSnapshot.isSyncEnabled === 'undefined') { 
                // This path should only be taken by stores explicitly marked as isAlwaysSynced (like Tags, CustomCategories)
                // OR very simple stores that don't have/need complex merging or toggles.
                // We should avoid this for stores that manage sensitive/complex data without their own hydrateFromSync.
                // This is a legacy path for stores that don't have/need complex merging or toggles.  If a store does not have a hydrateFromSync, it should not be used.
                store.setState(storeDataFromSnapshot);
              } else {
                 addSyncLog(`[Hydrate] ${storeKeyForLog}: Has isSyncEnabled in snapshot but no local hydrateFromSync/isAlwaysSynced. Check store setup. Defaulting to skip.`, 'warning');
              }
            }
            successCount++; 
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating ${storeKeyForLog}: ${(err as Error).message}`, 'error');
          }
        } else {
          addSyncLog(`ℹ️ No data for ${storeKeyForLog} in snapshot (or already deleted for exclusion), skipping hydration.`, 'info');
        }
      };
        
      tryHydrateStore('habits', useHabitStore, 'Habits');
      tryHydrateStore('bills', useBillStore, 'Bills');
      tryHydrateStore('projects', useProjectStore, 'Projects'); 
      tryHydrateStore('calendar', useCalendarStore, 'Calendar');
      tryHydrateStore('vault', useVaultStore, 'Vault');
      tryHydrateStore('people', usePeopleStore, 'People'); 
      tryHydrateStore('customCategory', useCustomCategoryStore, 'Custom Categories', true);
      tryHydrateStore('tags', useTagStore, 'Tags', true);

      // TaskStore has its own complex hydration, called separately for now
      // It will also need an isSyncEnabled flag and to be integrated into tryHydrateStore
      if (data.tasks) { 
        const taskStore = useTaskStore.getState();
        // Placeholder: if TaskStore gets an isSyncEnabled, check it here
        // if(taskStore.isSyncEnabled === false || (data.tasks.isSyncEnabled === false)) { ... skip ... }
        try {
          taskStore.hydrateFromSync(data.tasks); 
          successCount++;
          addSyncLog(`✅ Tasks hydrated with completion priority logic (pending toggle integration)`, 'success');
        } catch (err) {
          errorCount++;
          addSyncLog(`❌ Error hydrating tasks: ${(err as Error).message}`, 'error');
        }
      } else {
        addSyncLog(`ℹ️ No data for tasks in snapshot, skipping hydration.`, 'info');
      }
      
      set({ lastSyncAttempt: Date.now(), syncStatus: 'idle' });
      get().syncOnboardingWithUser();
      addSyncLog(`✨ Hydration complete: ${successCount} stores updated, ${errorCount} errors.`, 'success');
    },    
  };
});

// Initialize and sync onboarding status
const userOnboarding = useUserStore.getState().preferences.hasCompletedOnboarding;
useRegistryStore.getState().setHasCompletedOnboarding(userOnboarding);

// Contextual initialization message
if (userOnboarding) {
} else {
  // if we get here, either the user has not completed onboarding or the user is not premium so we need to seperate the logic
  if (useUserStore.getState().preferences.premium) {
    // user is premium, so we need to show a message that sync is disabled until onboarding completes
    console.log('⚙️ Registry store initialized (sync disabled until onboarding completes)');
  } else {
    // user is not premium, so we need to show a message that sync is disabled because user is not premium
    console.log('⚙️ Registry store initialized (sync disabled because user is not premium)');
  }
}
