import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';

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


interface RegistryState {
  hasCompletedOnboarding: boolean;
  isFirstLaunch: boolean;
  lastSyncAttempt: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  notificationStatus: 'granted' | 'denied' | 'unavailable';
  stocksLastUpdated: number;
  habitStore: Record<string, any>;
  weatherStore: Record<string, any>;
  billStore: Record<string, any>;
  calendarStore: Record<string, any>;
  todoStore: Record<string, any>;
  noteStore: Record<string, any>;
  wallpaperStore: Record<string, any>;
  userStore: Record<string, any>;
  networkStore: Record<string, any>;
  vaultStore: Record<string, any>;
  crmStore: Record<string, any>;
  portfolioStore: Record<string, any>;
  peopleStore: Record<string, any>;
  customCategoryStore: Record<string, any>;
  tagStore: Record<string, any>;
  setHasCompletedOnboarding: (value: boolean) => void;
  setIsFirstLaunch: (value: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setNotificationStatus: (status: 'granted' | 'denied' | 'unavailable') => void;
  setStocksLastUpdated: (timestamp: number) => void;
  checkNotificationStatus: () => Promise<void>;
  getAllStoreStates: () => Record<string, any>;
  logSyncStatus: () => void;
  exportStateToFile: () => Promise<string>;
}

export const useRegistryStore = create<RegistryState>((set, get) => ({
  // Initial state
  hasCompletedOnboarding: false,
  isFirstLaunch: true,
  lastSyncAttempt: Date.now(),
  syncStatus: 'idle',
  notificationStatus: 'unavailable',
  stocksLastUpdated: 0,

  // Store instances
  habitStore: useHabitStore.getState(),
  weatherStore: useWeatherStore.getState(),
  tagStore: useTagStore.getState(),
  billStore: useBillStore.getState(),
  todoStore: useProjectStore.getState(),
  calendarStore: useCalendarStore.getState(),
  noteStore: useNoteStore.getState(),
  wallpaperStore: useWallpaperStore.getState(),
  userStore: useUserStore.getState(),
  networkStore: useNetworkStore.getState(),
  vaultStore: useVaultStore.getState(),
  crmStore: useCRMStore.getState(),
  portfolioStore: usePortfolioStore.getState(),
  peopleStore: usePeopleStore.getState(),
  customCategoryStore: useCustomCategoryStore.getState(),

  // Actions
  setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
  setIsFirstLaunch: (value) => set({ isFirstLaunch: value }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setNotificationStatus: (status) => set({ notificationStatus: status }),
  setStocksLastUpdated: (timestamp) => set({ stocksLastUpdated: timestamp }),
  
  checkNotificationStatus: async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      set({ notificationStatus: status === 'granted' ? 'granted' : 'denied' });
    } catch (error) {
      console.error('Error checking notification status:', error);
      set({ notificationStatus: 'unavailable' });
    }
  },

  // Get all store states for syncing
  getAllStoreStates: () => {
    const now = Date.now();
    
    // Helper to safely get store state
    const getStoreState = (store: any) => {
      try {
        return typeof store === 'object' && store !== null 
          ? { ...store } 
          : {};
      } catch {
        return {};
      }
    };

    return {
      habits: { ...getStoreState(useHabitStore.getState()), lastUpdated: now },
      weather: { ...getStoreState(useWeatherStore.getState()), lastUpdated: now },
      bills: { ...getStoreState(useBillStore.getState()), lastUpdated: now },
      calendar: { ...getStoreState(useCalendarStore.getState()), lastUpdated: now },
      tasks: { ...getStoreState(useProjectStore.getState()), lastUpdated: now },
      notes: { ...getStoreState(useNoteStore.getState()), lastUpdated: now },
      wallpapers: { ...getStoreState(useWallpaperStore.getState()), lastUpdated: now },
      user: { ...getStoreState(useUserStore.getState()), lastUpdated: now },
      network: { ...getStoreState(useNetworkStore.getState()), lastUpdated: now },
      vault: { ...getStoreState(useVaultStore.getState()), lastUpdated: now },
      crm: { ...getStoreState(useCRMStore.getState()), lastUpdated: now },
      portfolio: { ...getStoreState(usePortfolioStore.getState()), lastUpdated: now },
      people: { ...getStoreState(usePeopleStore.getState()), lastUpdated: now },
      customCategory: { ...getStoreState(useCustomCategoryStore.getState()), lastUpdated: now },
      tags: { ...getStoreState(useTagStore.getState()), lastUpdated: now }
    };
  },

  // Pretty log for sync status
  logSyncStatus: () => {
    const state = get();
    const storeStates = state.getAllStoreStates();
    
    console.log(`
    🌟 Registry Sync Status 🌟
    🕒 Last Sync: ${new Date(state.lastSyncAttempt).toLocaleString()}
    📊 Sync Status: ${state.syncStatus}
    🔔 Notifications: ${state.notificationStatus}
    📈 Stocks Last Updated: ${new Date(state.stocksLastUpdated).toLocaleString()}
    📦 Stores Synced:
    ${Object.entries(storeStates)
      .map(([name, store]) => `    • ${name}: ${Object.keys(store).length} items`)
      .join('\n')}
    💾 Storage Status:
    • AsyncStorage: ${storage ? '✅ Available' : '❌ Not Available'}
    `);
  },

  // NEW ACTION: export full registry state to a JSON file
  exportStateToFile: async () => {
    try {
      const state = get();
      const allStores = state.getAllStoreStates();
      const fileUri = `${FileSystem.documentDirectory}stateSnapshot.json`;
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(allStores, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      console.log('✅ Exported state to', fileUri);
      return fileUri;
    } catch (error) {
      console.error('❌ Failed to export state:', error);
      throw error;
    }
  }
}));

// Log when store is created
console.log('🎉 Registry store successfully created!');
