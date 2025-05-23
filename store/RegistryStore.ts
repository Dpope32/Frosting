import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { exportEncryptedState } from '@/sync';
import { debounce } from 'lodash';

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
import { usePortfolioStore } from './PortfolioStore';
import { portfolioData } from '@/utils/Portfolio';

interface RegistryState {
  hasCompletedOnboarding: boolean;
  isFirstLaunch: boolean;
  lastSyncAttempt: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  notificationStatus: 'granted' | 'denied' | 'unavailable';
  stocksLastUpdated: number;
  workspaceId?: string | null;

  setHasCompletedOnboarding: (value: boolean) => void;
  setIsFirstLaunch: (value: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setNotificationStatus: (status: 'granted' | 'denied' | 'unavailable') => void;
  setStocksLastUpdated: (timestamp: number) => void;
  checkNotificationStatus: () => void; 
  getAllStoreStates: () => Record<string, any>;
  exportStateToFile: () => Promise<string | null>;
  hydrateAll: (data: Record<string, any>) => void;
  syncOnboardingWithUser: () => void;
  setWorkspaceId: (id: string | null) => void;
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
        addSyncLog(`[Snapshot] Bills sync ON: Including ${Object.keys(billStoreFullState.bills || {}).length} bills, income ${billStoreFullState.monthlyIncome}.`, 'info');
      } else {
        addSyncLog('[Snapshot] Bills sync OFF: Excluding bills and income.', 'info');
      }
      const vaultStoreFullState = useVaultStore.getState();
      let vaultStateForSnapshot: any = { isSyncEnabled: vaultStoreFullState.isSyncEnabled };
      if (vaultStoreFullState.isSyncEnabled) {
        vaultStateForSnapshot.vaultData = vaultStoreFullState.vaultData;
        vaultStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Passwords (Vault) sync ON: Including ${vaultStoreFullState.vaultData?.items?.length || 0} items.`, 'info');
      } else {
        addSyncLog('[Snapshot] Passwords (Vault) sync OFF: Excluding vault items.', 'info');
      }
      const projectStoreFullState = useProjectStore.getState();
      let projectStateForSnapshot: any = { isSyncEnabled: projectStoreFullState.isSyncEnabled };
      if (projectStoreFullState.isSyncEnabled) {
        projectStateForSnapshot.projects = projectStoreFullState.projects;
        projectStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Projects sync ON: Including ${projectStoreFullState.projects?.length || 0} projects.`, 'info');
      } else {
        addSyncLog('[Snapshot] Projects sync OFF: Excluding projects.', 'info');
      }
      const peopleStoreFullState = usePeopleStore.getState();
      let peopleStateForSnapshot: any = { isSyncEnabled: peopleStoreFullState.isSyncEnabled };
      if (peopleStoreFullState.isSyncEnabled) {
        peopleStateForSnapshot.contacts = peopleStoreFullState.contacts;
        peopleStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] People (Contacts) sync ON: Including ${Object.keys(peopleStoreFullState.contacts || {}).length} contacts.`, 'info');
      } else {
        addSyncLog('[Snapshot] People (Contacts) sync OFF: Excluding contacts.', 'info');
      }
      const habitStoreFullState = useHabitStore.getState();
      let habitStateForSnapshot: any = { isSyncEnabled: habitStoreFullState.isSyncEnabled };
      if (habitStoreFullState.isSyncEnabled) {
        habitStateForSnapshot.habits = habitStoreFullState.habits;
        habitStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Habits sync ON: Including ${Object.keys(habitStoreFullState.habits || {}).length} habits.`, 'info');
      } else {
        addSyncLog('[Snapshot] Habits sync OFF: Excluding habits.', 'info');
      }
      const calendarStoreFullState = useCalendarStore.getState();
      let calendarStateForSnapshot: any = { isSyncEnabled: calendarStoreFullState.isSyncEnabled };
      if (calendarStoreFullState.isSyncEnabled) {
        calendarStateForSnapshot.events = calendarStoreFullState.events;
        calendarStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Calendar sync ON: Including ${calendarStoreFullState.events?.length || 0} events.`, 'info');
      } else {
        addSyncLog('[Snapshot] Calendar sync OFF: Excluding calendar events.', 'info');
      }

      // Tasks sync handling
      const taskStoreFullState = useTaskStore.getState();
      let taskStateForSnapshot: any = { isSyncEnabled: taskStoreFullState.isSyncEnabled };
      if (taskStoreFullState.isSyncEnabled) {
        taskStateForSnapshot.tasks = taskStoreFullState.tasks;
        taskStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Tasks sync ON: Including ${Object.keys(taskStoreFullState.tasks || {}).length} tasks.`, 'info');
      } else {
        addSyncLog('[Snapshot] Tasks sync OFF: Excluding tasks.', 'info');
      }

      // Portfolio sync handling
      const portfolioStoreFullState = usePortfolioStore.getState();
      let portfolioStateForSnapshot: any = { isSyncEnabled: portfolioStoreFullState.isSyncEnabled };
      if (portfolioStoreFullState.isSyncEnabled) {
        portfolioStateForSnapshot.portfolio = portfolioData;
        portfolioStateForSnapshot.principal = portfolioStoreFullState.principal;
        portfolioStateForSnapshot.watchlist = portfolioStoreFullState.watchlist;
        portfolioStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Portfolio sync ON: Including ${portfolioData.length} stocks, ${portfolioStoreFullState.watchlist.length} watchlist items.`, 'info');
      } else {
        addSyncLog('[Snapshot] Portfolio sync OFF: Excluding stocks and portfolio data.', 'info');
      }

      // For stores that sync automatically (like CustomCategory and Tags as per user request)
      const customCategoryState = { ...useCustomCategoryStore.getState(), lastUpdated: now };
      const tagsState = { ...useTagStore.getState(), lastUpdated: now };
      addSyncLog('[Snapshot] CustomCategoryStore & TagStore: Syncing automatically (full data). ALWAYS ON ' + 'pulled ' + tagsState.tags.length + ' tags and ' + customCategoryState.categories.length + ' custom categories', 'info',);
      return {
        habits: habitStateForSnapshot,
        bills: billStateForSnapshot, 
        calendar: calendarStateForSnapshot,
        tasks: taskStateForSnapshot,
        portfolio: portfolioStateForSnapshot,
        notes: { sync_disabled: true, local_only: true, lastUpdated: now }, 
        user: { sync_disabled: true, lastUpdated: now }, 
        vault: vaultStateForSnapshot, 
        crm: { sync_disabled: true, ui_store: true, lastUpdated: now },
        people: peopleStateForSnapshot, 
        customCategory: customCategoryState, 
        tags: tagsState, 
        projects: projectStateForSnapshot, 
        wallpaper: { sync_disabled: true, local_cache_only: true, lastUpdated: now }, // Excluded
      };
    },

    exportStateToFile: async () => {
      const isPremium = useUserStore.getState().preferences.premium === true;
      if (!isPremium) return null;
      const now = Date.now();
      const lastSync = get().lastSyncAttempt;
      addSyncLog('🔄 Starting export', 'info', `Last sync: ${lastSync}ms ago`);

      if (now - lastSync < 2000) { 
        return null;
      }
    
      set({ syncStatus: 'syncing' });
      try {
    // Replace the diagnostic block in exportStateToFile:
    const allTasks = useTaskStore.getState().tasks;
    const pruneCandidates = Object.values(allTasks)
      .filter(task => {
        // Only one-time tasks that are completed
        if (task.recurrencePattern !== 'one-time' || !task.completed) return false;
        
        // Find when it was completed
        const completionDates = Object.entries(task.completionHistory || {})
          .filter(([_, completed]) => completed)
          .map(([date]) => date);
        
        return completionDates.length > 0;
      })
      .map(task => {
        // Get the most recent completion date
        const completionDates = Object.entries(task.completionHistory || {})
          .filter(([_, completed]) => completed)
          .map(([date]) => date)
          .sort();
        
            const lastCompleted = completionDates[completionDates.length - 1];
            const daysAgo = Math.floor((Date.now() - new Date(lastCompleted).getTime()) / (1000 * 60 * 60 * 24));
            
            return { task, daysAgo, lastCompleted };
          })
          .sort((a, b) => b.daysAgo - a.daysAgo) // Oldest completed first
          .slice(0, 10);

        pruneCandidates.forEach(({ task, daysAgo }) => {
          addSyncLog(`🪓 chopping block? – "${task.name}" – completed ${daysAgo}d ago`, "warning");
        });

        addSyncLog(`🪓 prune preview complete – ${pruneCandidates.length} candidates (one-time tasks completed >7d ago would be ideal targets)`, "info");
                const states = get().getAllStoreStates();
        const uri = await exportEncryptedState(states);
    
        set({ syncStatus: 'idle', lastSyncAttempt: now });
        addSyncLog('✅ Export complete', 'success');
        return uri;
      } catch (e) {
        set({ syncStatus: 'error' });
        addSyncLog(`❌ Export failed: ${(e as Error).message}`, 'error');
        return null;
      }
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
        addSyncLog('[Hydrate] UserStore: Data found in snapshot, explicitly DELETING and SKIPPING hydration.', 'warning');
        delete data.user;
      }
      if (data.notes) {
        addSyncLog('[Hydrate] NoteStore: Data found in snapshot, explicitly DELETING and SKIPPING hydration (local-only store).', 'warning');
        delete data.notes;
      }
      if (data.wallpaper) {
        addSyncLog('[Hydrate] WallpaperStore: Data found in snapshot, explicitly DELETING and SKIPPING hydration (local-cache-only store).', 'warning');
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
                addSyncLog(`[Hydrate] ${storeKeyForLog}: Local sync is OFF. Skipping hydration.`, 'info');
              } else {
                storeState.hydrateFromSync(storeDataFromSnapshot);
                addSyncLog(`✅ ${storeKeyForLog} hydrated via hydrateFromSync`, 'success');
              }
            } else {
              if (isAlwaysSynced || typeof storeDataFromSnapshot.isSyncEnabled === 'undefined') { 
                // This path should only be taken by stores explicitly marked as isAlwaysSynced (like Tags, CustomCategories)
                // OR very simple stores that don't have/need complex merging or toggles.
                // We should avoid this for stores that manage sensitive/complex data without their own hydrateFromSync.
                // This is a legacy path for stores that don't have/need complex merging or toggles.  If a store does not have a hydrateFromSync, it should not be used.
                store.setState(storeDataFromSnapshot);
                addSyncLog(`✅ ${storeKeyForLog} hydrated via setState (${isAlwaysSynced ? 'always-on store' : 'legacy/no toggle or sync flag in snapshot'}).`, 'info');
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
      tryHydrateStore('tasks', useTaskStore, 'Tasks');
      tryHydrateStore('portfolio', usePortfolioStore, 'Portfolio');

      // Remove the separate TaskStore hydration since it's now handled by tryHydrateStore
      
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
    addSyncLog('⚙️ Registry store initialized (sync disabled until onboarding completes)', 'info');
  } else {
    // user is not premium, so we need to show a message that sync is disabled because user is not premium
    addSyncLog('⚙️ Registry store initialized (sync disabled because user is not premium)', 'info');
  }
}
