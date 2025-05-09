import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { UserPreferences } from '@/types/user';

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
  showNBAGamesInCalendar: false,
  showNBAGameTasks: false, 
  permissionsExplained: false,
  premium: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      hydrated: false,
      setPreferences: (newPrefs) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPrefs,
          },
        }));
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
