import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import { exportEncryptedState } from '@/sync/registrySyncManager';
import { debounce } from 'lodash';
import * as Sentry from '@sentry/react-native';

// Import all stores
import { useHabitStore } from './HabitStore';
import { useWeatherStore } from './WeatherStore';
import { useBillStore } from './BillStore';
import { useCalendarStore } from './CalendarStore';
import { useProjectStore } from './ToDo';
import { useNoteStore } from './NoteStore';
import { useWallpaperStore } from './WallpaperStore';
import { useUserStore } from './UserStore';
import { useNetworkStore } from './NetworkStore';
import { useVaultStore } from './VaultStore';
import { storage } from './AsyncStorage';
import { useCRMStore } from './CRMStore';
import { usePortfolioStore } from './PortfolioStore';
import { usePeopleStore } from './People';
import { useCustomCategoryStore } from './CustomCategoryStore';
import { useTagStore } from './TagStore';
import { useProjectStore as useProjectsStore } from './ProjectStore';

interface RegistryState {
  hasCompletedOnboarding: boolean;
  isFirstLaunch: boolean;
  lastSyncAttempt: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  notificationStatus: 'granted' | 'denied' | 'unavailable';
  stocksLastUpdated: number;

  setHasCompletedOnboarding: (value: boolean) => void;
  setIsFirstLaunch: (value: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setNotificationStatus: (status: 'granted' | 'denied' | 'unavailable') => void;
  setStocksLastUpdated: (timestamp: number) => void;
  checkNotificationStatus: () => void; // Changed to void to match debounced function
  getAllStoreStates: () => Record<string, any>;
  logSyncStatus: () => void;
  exportStateToFile: () => Promise<string | null>;
  hydrateAll: (data: Record<string, any>) => void;
  syncOnboardingWithUser: () => void;
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
    
    // Synchronize with UserStore when setting onboarding flag
    setHasCompletedOnboarding: (value) => {
      set({ hasCompletedOnboarding: value });
      // Sync with UserStore when this changes
      useUserStore.setState(state => ({
        preferences: {
          ...state.preferences,
          hasCompletedOnboarding: value
        }
      }));
    },
    
    setIsFirstLaunch: (value) => set({ isFirstLaunch: value }),
    setSyncStatus: (status) => set({ syncStatus: status }),
    setNotificationStatus: (status) => set({ notificationStatus: status }),
    setStocksLastUpdated: (timestamp) => set({ stocksLastUpdated: timestamp }),

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
        weather: grab(useWeatherStore.getState()),
        bills: grab(useBillStore.getState()),
        calendar: grab(useCalendarStore.getState()),
        tasks: grab(useProjectStore.getState()),
        notes: grab(useNoteStore.getState()),
        wallpapers: grab(useWallpaperStore.getState()),
        user: grab(useUserStore.getState()),
        network: grab(useNetworkStore.getState()),
        vault: grab(useVaultStore.getState()),
        crm: grab(useCRMStore.getState()),
        portfolio: grab(usePortfolioStore.getState()),
        people: grab(usePeopleStore.getState()),
        customCategory: grab(useCustomCategoryStore.getState()),
        tags: grab(useTagStore.getState()),
        projects: grab(useProjectsStore.getState()),
      };
    },

    logSyncStatus: () => {
      const isPremium = useUserStore.getState().preferences.premium === true;
      if (!isPremium) return;
      // Check if onboarding is completed before logging
      const hasCompletedOnboarding = useUserStore.getState().preferences.hasCompletedOnboarding;
      
      if (!hasCompletedOnboarding) {
        console.log('⏸️ Skipping sync status logging - onboarding not completed');
        return;
      }
      
      const s = get();
      const states = s.getAllStoreStates();
      console.log(`
      🌟 Registry Sync Status 🌟
      🕒 Last Sync: ${new Date(s.lastSyncAttempt).toLocaleString()}
      📊 Sync Status: ${s.syncStatus}
      🔔 Notifications: ${s.notificationStatus}
      📈 Stocks Last Updated: ${new Date(s.stocksLastUpdated).toLocaleString()}
      📦 Stores Synced:
  ${Object.entries(states)
    .map(([k, v]) => `    • ${k}: ${Object.keys(v).length} items`)
    .join('\n')}
      💾 Storage Status:
      • AsyncStorage: ${storage ? '✅ Available' : '❌ Not Available'}
      `);
    },

    exportStateToFile: async () => {
      const isPremium = useUserStore.getState().preferences.premium === true;
      if (!isPremium) return null;
      Sentry.addBreadcrumb({
        category: 'registry',
        message: 'exportStateToFile called',
        level: 'info',
      });
      // Use the simpler onboarding check
      const hasCompletedOnboarding = useUserStore.getState().preferences.hasCompletedOnboarding;
      // Keep registry store in sync with user store
      if (get().hasCompletedOnboarding !== hasCompletedOnboarding) {
        set({ hasCompletedOnboarding: hasCompletedOnboarding });
      }
      if (!hasCompletedOnboarding) {
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'Skipping export - onboarding not completed',
          level: 'warning',
        });
        console.log('⏸️ Skipping sync/export - onboarding not completed');
        return null;
      }
      // Prevent duplicate exports in quick succession
      const now = Date.now();
      const lastSync = get().lastSyncAttempt;
      const MIN_SYNC_INTERVAL = 2000; // 2 seconds
      if (now - lastSync < MIN_SYNC_INTERVAL) {
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'Skipping duplicate export - too soon since last export',
          level: 'warning',
        });
        console.log('⏸️ Skipping duplicate export - too soon since last export');
        return null;
      }
      set({ syncStatus: 'syncing' });
      try {
        const states = get().getAllStoreStates();
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'Calling exportEncryptedState',
          data: { statesKeys: Object.keys(states) },
          level: 'info',
        });
        const uri = await exportEncryptedState(states);
        set({ syncStatus: 'idle', lastSyncAttempt: now });
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'Encrypted export complete',
          data: { uri },
          level: 'info',
        });
        console.log('✅ Encrypted export at', uri);
        return uri;
      } catch (e) {
        set({ syncStatus: 'error' });
        Sentry.captureException(e);
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'Error during exportStateToFile',
          data: { error: e },
          level: 'error',
        });
        console.error('❌ Sync failed', e);
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
      Sentry.addBreadcrumb({
        category: 'registry',
        message: 'hydrateAll called',
        data: { keys: data ? Object.keys(data) : [] },
        level: 'info',
      });
      console.log('🔄 Hydrating all stores from import data...');
      try {
        // Ensure we have data to work with
        if (!data || typeof data !== 'object') {
          Sentry.addBreadcrumb({
            category: 'registry',
            message: 'Invalid data for hydration',
            level: 'error',
          });
          console.error('❌ Invalid data for hydration');
          return;
        }
        // Store data to validate and apply
        const storeMap: Array<{key: string; data: any; validate?: boolean}> = [
          { key: 'habits', data: data.habits, validate: true },
          { key: 'weather', data: data.weather },
          { key: 'bills', data: data.bills },
          { key: 'calendar', data: data.calendar },
          { key: 'tasks', data: data.tasks },
          { key: 'notes', data: data.notes, validate: true },
          { key: 'wallpapers', data: data.wallpapers },
          { key: 'user', data: data.user, validate: true },
          { key: 'network', data: data.network },
          { key: 'vault', data: data.vault },
          { key: 'crm', data: data.crm },
          { key: 'portfolio', data: data.portfolio },
          { key: 'people', data: data.people },
          { key: 'customCategory', data: data.customCategory },
          { key: 'tags', data: data.tags },
          { key: 'projects', data: data.projects }
        ];
        // Apply each store's data if it exists and passes validation
        storeMap.forEach(({ key, data, validate }) => {
          if (!data) return;
          // Skip validation for stores without validators
          if (validate && key in validators) {
            const validator = validators[key as keyof typeof validators];
            if (!validator(data)) {
              Sentry.addBreadcrumb({
                category: 'registry',
                message: `Skipping invalid ${key} data`,
                level: 'warning',
              });
              console.warn(`⚠️ Skipping invalid ${key} data`);
              return;
            }
          }
          // Apply data to the appropriate store
          try {
            switch(key) {
              case 'habits':
                useHabitStore.setState(data);
                break;
              case 'weather':
                useWeatherStore.setState(data);
                break;
              case 'bills':
                useBillStore.setState(data);
                break;
              case 'calendar':
                useCalendarStore.setState(data);
                break;
              case 'tasks':
                useProjectStore.setState(data);
                break;
              case 'notes':
                useNoteStore.setState(data);
                break;
              case 'wallpapers':
                useWallpaperStore.setState(data);
                break;
              case 'user':
                useUserStore.setState(data);
                break;
              case 'network':
                useNetworkStore.setState(data);
                break;
              case 'vault':
                useVaultStore.setState(data);
                break;
              case 'crm':
                useCRMStore.setState(data);
                break;
              case 'portfolio':
                usePortfolioStore.setState(data);
                break;
              case 'people':
                usePeopleStore.setState(data);
                break;
              case 'customCategory':
                useCustomCategoryStore.setState(data);
                break;
              case 'tags':
                useTagStore.setState(data);
                break;
              case 'projects':
                useProjectsStore.setState(data);
                break;
            }
            Sentry.addBreadcrumb({
              category: 'registry',
              message: `Applied ${key} data`,
              level: 'info',
            });
            console.log(`✓ Applied ${key} data`);
          } catch (err) {
            Sentry.captureException(err);
            Sentry.addBreadcrumb({
              category: 'registry',
              message: `Error applying ${key} data`,
              data: { error: err },
              level: 'error',
            });
            console.error(`❌ Error applying ${key} data:`, err);
          }
        });
        // Update registry metadata and sync onboarding status
        const timestamp = Date.now();
        set({
          lastSyncAttempt: timestamp,
          syncStatus: 'idle',
        });
        // Make sure onboarding status is in sync
        get().syncOnboardingWithUser();
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'All stores hydrated successfully from external data',
          level: 'info',
        });
        console.log('✅ All stores hydrated successfully from external data');
      } catch (error) {
        Sentry.captureException(error);
        Sentry.addBreadcrumb({
          category: 'registry',
          message: 'Error hydrating stores',
          data: { error },
          level: 'error',
        });
        console.error('❌ Error hydrating stores:', error);
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
  console.log('⚙️ Registry store initialized (sync disabled until onboarding completes)');
}
