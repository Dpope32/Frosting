import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPersistStorage } from './AsyncStorage';
import { BackgroundStyle } from '../constants/Backgrounds';

interface UserPreferences {
  username: string;
  profilePicture?: string;
  primaryColor: string;
  backgroundStyle: BackgroundStyle;
  customBackground?: string;
  zipCode: string;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  quoteEnabled: boolean;
  favoriteNBATeam?: string; // Team code (e.g., "OKC")
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
  backgroundStyle: 'gradient',
  zipCode: '',
  hasCompletedOnboarding: false,
  notificationsEnabled: true,
  quoteEnabled: true,
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
