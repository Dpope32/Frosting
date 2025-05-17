import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { exportEncryptedState } from '@/sync';
import { debounce } from 'lodash';

// Import all stores
import { useHabitStore } from './HabitStore';
import { useBillStore } from './BillStore';
import { useCalendarStore } from './CalendarStore';
import { useProjectStore } from './ToDo';
import { useNoteStore } from './NoteStore';
import { useUserStore } from './UserStore';
import { useVaultStore } from './VaultStore';
import { useCRMStore } from './CRMStore';
import { usePeopleStore } from './People';
import { useCustomCategoryStore } from './CustomCategoryStore';
import { useTagStore } from './TagStore';
import { useProjectStore as useProjectsStore } from './ProjectStore';
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
  logSyncStatus: () => void;
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
        
      return {
        habits: grab(useHabitStore.getState()),
        bills: grab(useBillStore.getState()),
        calendar: grab(useCalendarStore.getState()),
        tasks: grab(useProjectStore.getState()),
        notes: grab(useNoteStore.getState()),
        user: grab(useUserStore.getState()),
        vault: grab(useVaultStore.getState()),
        crm: grab(useCRMStore.getState()),
        people: grab(usePeopleStore.getState()),
        customCategory: grab(useCustomCategoryStore.getState()),
        tags: grab(useTagStore.getState()),
        projects: grab(useProjectsStore.getState()),
      };
    },

    logSyncStatus: () => {
      const isPremium = useUserStore.getState().preferences.premium === true;
      if (!isPremium) return;
    
      const hasCompletedOnboarding = useUserStore
        .getState()
        .preferences.hasCompletedOnboarding;
      if (!hasCompletedOnboarding) {
        return;
      }
    
      const s = get();
      addSyncLog(`📊 Sync Status: ${s.syncStatus}`, 'info');
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
    
        // Track success and error counts for summary
        let successCount = 0;
        let errorCount = 0;
    
        // Handle each store type
        if (data.habits) {
          try {
            if (validators.habits && !validators.habits(data.habits)) {
              errorCount++;
            } else {
              useHabitStore.setState(data.habits);
              successCount++;
              addSyncLog('✅ Rehydrated habits store', 'verbose');
            }
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating habits`, 'error');
          }
        }
    
        if (data.tasks) {
          try {
            useProjectStore.setState(data.tasks);
            successCount++;
            addSyncLog('✅ Rehydrated tasks store', 'verbose');
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating tasks`, 'error');
          }
        }
        
        // Add other stores that might be missing
        if (data.projects) {
          try {
            useProjectsStore.setState(data.projects);
            successCount++;
            addSyncLog('✅ Rehydrated projects store', 'verbose');
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating projects`, 'error');
          }
        }
        
        if (data.notes) {
          try {
            useNoteStore.setState(data.notes);
            successCount++;
            addSyncLog('✅ Rehydrated notes store', 'verbose');
          } catch (err) {
            errorCount++;
            addSyncLog(`❌ Error hydrating notes`, 'error');
          }
        }
    
        // Force UI refresh after hydration
        set({ lastSyncAttempt: Date.now(), syncStatus: 'idle' });
        get().syncOnboardingWithUser();
        
        // Single summary log
        addSyncLog(`✨ Hydration complete: ${successCount} stores updated`, 'success');
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
