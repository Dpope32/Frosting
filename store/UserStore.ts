import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { BackgroundStyle } from '../constants/Backgrounds'
import { useProjectStore } from './ToDo' // Import ProjectStore to trigger recalculation

export interface UserPreferences {
  username: string;
  profilePicture?: string;
  primaryColor: string;
  customBackground?: string;
  zipCode: string;
  backgroundStyle?: BackgroundStyle;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  quoteEnabled: boolean;
  portfolioEnabled: boolean;
  temperatureEnabled: boolean;
  wifiEnabled: boolean;
  favoriteNBATeam?: string;
  showNBAGamesInCalendar: boolean;
  showNBAGameTasks: boolean; // Added preference for showing NBA tasks
  permissionsExplained: boolean;
}

interface UserStore {
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
  hydrated: boolean;
}

const defaultPreferences: UserPreferences = {
  username: '',
  primaryColor: '#007AFF',
  zipCode: '',
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
  quoteEnabled: true,
  portfolioEnabled: true,
  temperatureEnabled: true,
  wifiEnabled: true,
  showNBAGamesInCalendar: true,
  showNBAGameTasks: true, // Default to true for existing users
  permissionsExplained: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      hydrated: false,
      setPreferences: (newPrefs) => {
        const oldPrefs = useUserStore.getState().preferences; // Get current state before update
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPrefs,
          },
        }));
        // Check if relevant preferences changed and trigger recalculation
        if (
          ('showNBAGameTasks' in newPrefs && newPrefs.showNBAGameTasks !== oldPrefs.showNBAGameTasks) ||
          ('showNBAGamesInCalendar' in newPrefs && newPrefs.showNBAGamesInCalendar !== oldPrefs.showNBAGamesInCalendar)
        ) {
          // Use setTimeout to ensure the state update completes before recalculating
          setTimeout(() => {
             useProjectStore.getState().recalculateTodaysTasks();
          }, 0);
        }
      },
      clearPreferences: () =>
        set({
          preferences: defaultPreferences,
        }),
    }),
    {
      name: 'user-preferences',
      storage: createPersistStorage<UserStore>(),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    }
  )
);
