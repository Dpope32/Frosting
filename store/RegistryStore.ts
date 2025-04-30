import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Import all stores
import { useHabitStore } from './HabitStore';
import { useWeatherStore } from './WeatherStore';
import { useBillStore } from './BillStore';
import { useCalendarStore } from './CalendarStore';
import { useProjectStore } from './ToDo';
import { useToastStore } from './ToastStore';
import { useNoteStore } from './NoteStore';
import { useWallpaperStore } from './WallpaperStore';
import { useUserStore } from './UserStore';
import { useEditStockStore } from './EditStockStore';
import { useEditTaskStore } from './EditTaskStore';
import { useNetworkStore } from './NetworkStore';
import { useVaultStore } from './VaultStore';
import { useCalendarViewStore } from './CalendarViewStore';
import { useNBAStore } from './NBAStore';
import { storage } from './AsyncStorage';
import { useCRMStore } from './CRMStore';
import { useRecommendationStore } from './RecommendationStore';
import { usePortfolioStore } from './PortfolioStore';
import { usePeopleStore } from './People';

interface RegistryState {
  // Basic flags
  hasCompletedOnboarding: boolean;
  isFirstLaunch: boolean;
  lastSyncAttempt: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  notificationStatus: 'granted' | 'denied' | 'unavailable';
  stocksLastUpdated: number;
  
  // Store instances
  habitStore: ReturnType<typeof useHabitStore>;
  weatherStore: ReturnType<typeof useWeatherStore>;
  billStore: ReturnType<typeof useBillStore>;
  calendarStore: ReturnType<typeof useCalendarStore>;
  todoStore: ReturnType<typeof useProjectStore>;
  toastStore: ReturnType<typeof useToastStore>;
  noteStore: ReturnType<typeof useNoteStore>;
  wallpaperStore: ReturnType<typeof useWallpaperStore>;
  userStore: ReturnType<typeof useUserStore>;
  editStockStore: ReturnType<typeof useEditStockStore>;
  editTaskStore: ReturnType<typeof useEditTaskStore>;
  networkStore: ReturnType<typeof useNetworkStore>;
  vaultStore: ReturnType<typeof useVaultStore>;
  calendarViewStore: ReturnType<typeof useCalendarViewStore>;
  nbaStore: ReturnType<typeof useNBAStore>;
  crmStore: ReturnType<typeof useCRMStore>;
  recommendationStore: ReturnType<typeof useRecommendationStore>;
  portfolioStore: ReturnType<typeof usePortfolioStore>;
  peopleStore: ReturnType<typeof usePeopleStore>;
  
  // Actions
  setHasCompletedOnboarding: (value: boolean) => void;
  setIsFirstLaunch: (value: boolean) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setNotificationStatus: (status: 'granted' | 'denied' | 'unavailable') => void;
  setStocksLastUpdated: (timestamp: number) => void;
  checkNotificationStatus: () => Promise<void>;
  getAllStoreStates: () => Record<string, any>;
  logSyncStatus: () => void;
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
  billStore: useBillStore.getState(),
  calendarStore: useCalendarStore.getState(),
  todoStore: useProjectStore.getState(),
  toastStore: useToastStore.getState(),
  noteStore: useNoteStore.getState(),
  wallpaperStore: useWallpaperStore.getState(),
  userStore: useUserStore.getState(),
  editStockStore: useEditStockStore.getState(),
  editTaskStore: useEditTaskStore.getState(),
  networkStore: useNetworkStore.getState(),
  vaultStore: useVaultStore.getState(),
  calendarViewStore: useCalendarViewStore.getState(),
  nbaStore: useNBAStore.getState(),
  crmStore: useCRMStore.getState(),
  recommendationStore: useRecommendationStore.getState(),
  portfolioStore: usePortfolioStore.getState(),
  peopleStore: usePeopleStore.getState(),

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
    const state = get();
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
      habits: { ...getStoreState(state.habitStore), lastUpdated: now },
      weather: { ...getStoreState(state.weatherStore), lastUpdated: now },
      bills: { ...getStoreState(state.billStore), lastUpdated: now },
      calendar: { ...getStoreState(state.calendarStore), lastUpdated: now },
      tasks: { ...getStoreState(state.todoStore), lastUpdated: now },
      notes: { ...getStoreState(state.noteStore), lastUpdated: now },
      wallpapers: { ...getStoreState(state.wallpaperStore), lastUpdated: now },
      user: { ...getStoreState(state.userStore), lastUpdated: now },
      stocks: { ...getStoreState(state.editStockStore), lastUpdated: now },
      tasksEdit: { ...getStoreState(state.editTaskStore), lastUpdated: now },
      network: { ...getStoreState(state.networkStore), lastUpdated: now },
      vault: { ...getStoreState(state.vaultStore), lastUpdated: now },
      calendarView: { ...getStoreState(state.calendarViewStore), lastUpdated: now },
      nba: { ...getStoreState(state.nbaStore), lastUpdated: now },
      crm: { ...getStoreState(state.crmStore), lastUpdated: now },
      recommendations: { ...getStoreState(state.recommendationStore), lastUpdated: now },
      portfolio: { ...getStoreState(state.portfolioStore), lastUpdated: now },
      people: { ...getStoreState(state.peopleStore), lastUpdated: now }
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
  }
}));

// Log when store is created
console.log('🎉 Registry store successfully created!');
