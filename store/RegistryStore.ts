import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { exportEncryptedState } from '@/sync';
import { debounce } from 'lodash';

// Import all stores
import { useHabitStore } from './HabitStore';
import { useBillStore } from './BillStore';
import { useCalendarStore } from './CalendarStore';
import { useProjectStore as useTaskStore } from './ToDo';
import { useNoteStore } from './NoteStore';
import { useUserStore } from './UserStore';
import { useVaultStore } from './VaultStore';
import { useCRMStore } from './CRMStore';
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

// Schema validation helpers
const validateSchema = (data: any, requiredKeys: string[], storeName: string): boolean => {
  if (!data || typeof data !== 'object') {
    console.error(`❌ Invalid data format for ${storeName}`);
    return false;
  }
  
  // Check for minimal required structure based on store type
  const missingKeys = requiredKeys.filter(key => !(key in data));
  if (missingKeys.length > 0) {
    console.error(`❌ Missing required keys in ${storeName}: ${missingKeys.join(', ')}`);
    return false;
  }
  
  return true;
};

// Store-specific validators
const validators: Record<string, (data: any) => boolean> = {
  habits: (data) => validateSchema(data, ['habits', 'lastUpdated'], 'habits'),
  notes: (data) => validateSchema(data, ['notes', 'lastUpdated'], 'notes'),
  user: (data) => validateSchema(data, ['preferences', 'hydrated'], 'user'),
  // Add more store validators as needed
};

// Helper function to safely apply data to a store
const applyToStore = (data: any, setter: any): void => {
  try {
    setter(data);
  } catch (error) {
    console.error('Error setting store data:', error);
  }
};

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

    // Always get fresh states from all stores
    getAllStoreStates: () => {
      const now = Date.now();
      const grab = (store: any) =>
        typeof store === 'object' && store ? { ...store, lastUpdated: now } : { lastUpdated: now };
      

      // BillStore processing
      const billStoreFullState = useBillStore.getState();
      let billStateForSnapshot: any = { 
        isSyncEnabled: billStoreFullState.isSyncEnabled,
      };
      if (billStoreFullState.isSyncEnabled) {
        billStateForSnapshot.bills = billStoreFullState.bills;
        billStateForSnapshot.monthlyIncome = billStoreFullState.monthlyIncome;
        billStateForSnapshot.lastUpdated = now; 
        addSyncLog(`[Snapshot] Bills sync ON: Including ${Object.keys(billStoreFullState.bills || {}).length} bills and income ${billStoreFullState.monthlyIncome}.`, 'info');
      } else {
        addSyncLog('[Snapshot] Bills sync OFF: Excluding bills and income from snapshot.', 'info');
      }

      // VaultStore processing
      const vaultStoreFullState = useVaultStore.getState();
      let vaultStateForSnapshot: any = {
        isSyncEnabled: vaultStoreFullState.isSyncEnabled, 
      };
      if (vaultStoreFullState.isSyncEnabled) {
        vaultStateForSnapshot.vaultData = vaultStoreFullState.vaultData;
        vaultStateForSnapshot.lastUpdated = now; 
        addSyncLog(`[Snapshot] Passwords (Vault) sync ON: Including ${vaultStoreFullState.vaultData?.items?.length || 0} items.`, 'info');
      } else {
        addSyncLog('[Snapshot] Passwords (Vault) sync OFF: Excluding vault items from snapshot.', 'info');
      }
        
      // ProjectStore (for actual Projects) processing
      const projectStoreFullState = useProjectStore.getState(); // Actual ProjectStore
      let projectStateForSnapshot: any = {
        isSyncEnabled: projectStoreFullState.isSyncEnabled,
      };
      if (projectStoreFullState.isSyncEnabled) {
        projectStateForSnapshot.projects = projectStoreFullState.projects;
        projectStateForSnapshot.lastUpdated = now;
        addSyncLog(`[Snapshot] Projects sync ON: Including ${projectStoreFullState.projects?.length || 0} projects.`, 'info');
      } else {
        addSyncLog('[Snapshot] Projects sync OFF: Excluding projects from snapshot.', 'info');
      }
        
      return {
        habits: grab(useHabitStore.getState()),
        bills: billStateForSnapshot,
        calendar: grab(useCalendarStore.getState()),
        tasks: grab(useTaskStore.getState()),
        notes: grab(useNoteStore.getState()),
        user: grab(useUserStore.getState()),
        vault: vaultStateForSnapshot, // Use the conditionally prepared vault state
        crm: grab(useCRMStore.getState()),
        people: grab(usePeopleStore.getState()),
        customCategory: grab(useCustomCategoryStore.getState()),
        tags: grab(useTagStore.getState()),
        projects: projectStateForSnapshot, // This is for actual Projects
      };
    },

    exportStateToFile: async () => {
      const isPremium = useUserStore.getState().preferences.premium === true;
      if (!isPremium) return null;
    
      const now = Date.now();
      const lastSync = get().lastSyncAttempt;
      if (now - lastSync < 2000) {
        return null;
      }
    
      set({ syncStatus: 'syncing' });
      try {
        addSyncLog('🔄 Starting export', 'info');
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
    
      try {
        if (!data || typeof data !== 'object') {
          addSyncLog('❌ Invalid data for hydration', 'error');
          return;
        }
    
        let successCount = 0;
        let errorCount = 0;
    
        // Helper function to attempt hydration for a store
        const tryHydrateStore = (storeName: keyof typeof data, store: any, storeKeyForLog: string) => {
          if (data[storeName]) {
            try {
              const storeState = store.getState();
              // Prefer hydrateFromSync if available
              if (storeState.hydrateFromSync && typeof storeState.hydrateFromSync === 'function') {
                storeState.hydrateFromSync(data[storeName]);
                addSyncLog(`✅ ${storeKeyForLog} hydrated via hydrateFromSync`, 'success');
              } else {
                // Fallback to setState
                store.setState(data[storeName]);
                addSyncLog(`✅ ${storeKeyForLog} hydrated via setState`, 'success');
              }
              successCount++;
            } catch (err) {
              errorCount++;
              addSyncLog(`❌ Error hydrating ${storeKeyForLog}: ${(err as Error).message}`, 'error');
            }
          } else {
            addSyncLog(`ℹ️ No data for ${storeKeyForLog} in snapshot, skipping hydration.`, 'info');
          }
        };
        
        // Habits (existing logic, adapted slightly for consistency if needed)
        if (data.habits) {
          try {
            if (validators.habits && !validators.habits(data.habits)) {
              errorCount++;
               addSyncLog(`❌ Invalid schema for habits`, 'error');
            } else {
              useHabitStore.setState(data.habits);
              successCount++;
              addSyncLog(`✅ Habits hydrated`, 'success');
            }
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating habits: ${(err as Error).message}`, 'error');
          }
        } else {
           addSyncLog(`ℹ️ No data for habits in snapshot, skipping hydration.`, 'info');
        }

        // CustomCategoryStore (fixed and made optional)
        tryHydrateStore('customCategory', useCustomCategoryStore, 'Custom Categories');

        // Tasks (existing specialized logic)
        if (data.tasks) {
          try {
            useTaskStore.getState().hydrateFromSync(data.tasks);
            successCount++;
            addSyncLog(`✅ Tasks hydrated with completion priority logic`, 'success');
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating tasks: ${(err as Error).message}`, 'error');
          }
        } else {
          addSyncLog(`ℹ️ No data for tasks in snapshot, skipping hydration.`, 'info');
        }
        
        // Projects (existing logic, adapted)
        tryHydrateStore('projects', useProjectStore, 'Projects');
        
        // Notes (existing logic, adapted)
        tryHydrateStore('notes', useNoteStore, 'Notes');

        // Optional hydration for other stores:
        // Bills store will now use its own hydrateFromSync logic which respects its internal isSyncEnabled flag.
        tryHydrateStore('bills', useBillStore, 'Bills');
        tryHydrateStore('calendar', useCalendarStore, 'Calendar');
        
        // User store: Special care might be needed depending on what's in user preferences
        // For now, direct setState if data.user exists.
        if (data.user) {
            try {
                // Check for specific hydrate function or apply directly.
                // UserStore likely doesn't have hydrateFromSync to avoid overwriting local device prefs
                // unless explicitly designed to.
                // Let's assume direct state setting is okay for now, or you might have specific fields to merge.
                const currentUserState = useUserStore.getState();
                const incomingUserState = data.user;
                
                // Example of merging preferences if that's desired,
                // otherwise, a direct setState might overwrite things like `hydrated` or `premium` incorrectly.
                // This part needs to be tailored to how you want user settings to sync.
                // For now, a simple setState for demonstration.
                useUserStore.setState({ ...currentUserState, ...incomingUserState, preferences: { ...currentUserState.preferences, ...incomingUserState.preferences } });
                // Or, if UserStore has its own `hydrateFromSync`
                // if (useUserStore.getState().hydrateFromSync) {
                //   useUserStore.getState().hydrateFromSync(data.user);
                // } else {
                //   useUserStore.setState(data.user);
                // }
                successCount++;
                addSyncLog(`✅ User store hydrated`, 'success');
            } catch (err) {
                errorCount++;
                addSyncLog(`❌ Error hydrating User store: ${(err as Error).message}`, 'error');
            }
        } else {
          addSyncLog(`ℹ️ No data for User store in snapshot, skipping hydration.`, 'info');
        }

        tryHydrateStore('vault', useVaultStore, 'Vault');
        tryHydrateStore('crm', useCRMStore, 'CRM');
        tryHydrateStore('people', usePeopleStore, 'People');
        tryHydrateStore('tags', useTagStore, 'Tags');
    
        set({ lastSyncAttempt: Date.now(), syncStatus: 'idle' });
        get().syncOnboardingWithUser();
        
        addSyncLog(`✨ Hydration complete: ${successCount} stores updated, ${errorCount} errors.`, 'success');
      } catch (err) {
        addSyncLog(`❌ Hydration failed: ${(err as Error).message}`, 'error');
        set({ syncStatus: 'error' });
      }
    },    
  };
});

// Initialize and sync onboarding status
const userOnboarding = useUserStore.getState().preferences.hasCompletedOnboarding;
useRegistryStore.getState().setHasCompletedOnboarding(userOnboarding);

// Contextual initialization message
if (userOnboarding) {
  console.log('🎉 Registry store successfully created and ready for sync!');
} else {
  // if we get here, either the user has not completed onboarding or the user is not premium so we need to seperate the logic
  if (useUserStore.getState().preferences.premium) {
    console.log('⚙️ Registry store initialized (sync disabled until onboarding completes)');
  } else {
    console.log('⚙️ Registry store initialized (sync disabled because user is not premium)');
  }
}
