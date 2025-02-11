import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StorageUtils } from './MMKV';
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
};

// Create a custom storage adapter for MMKV
const mmkvStorage = {
  getItem: (name: string): string | null => {
    const value = StorageUtils.get<string>(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    StorageUtils.set(name, value);
  },
  removeItem: (name: string): void => {
    StorageUtils.delete(name);
  },
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
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
        }
      },
    }
  )
);
