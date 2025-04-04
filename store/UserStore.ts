import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { BackgroundStyle } from '../constants/Backgrounds';

export interface UserPreferences { // Add export keyword here
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
  permissionsExplained: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      hydrated: false,
      setPreferences: (newPrefs) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPrefs,
          },
        })),
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
