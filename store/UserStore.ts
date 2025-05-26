import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { UserPreferences } from '@/types'
import * as Sentry from '@sentry/react-native';
import { AUTHORIZED_USERS } from '@/constants';

interface UserStore {
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
  hydrated: boolean;
  get syncAccess(): string;
}

export const defaultPreferences: UserPreferences = {
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
  calendarPermission: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
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
      get syncAccess() {
        const state = get();
        const premium = state.preferences.premium === true;
        const username = state.preferences.username || '';
        
        if (premium) return 'premium';
        if (AUTHORIZED_USERS.includes(username.trim())) return 'authorized';
        return 'none';
      }
    }),
    {
      name: 'user-preferences',
      storage: createPersistStorage<UserStore>(),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          if (!state.preferences.profilePicture) {
            Sentry.captureException(new Error('User profile picture missing after store hydration'));
          }
        }
      },
    }
  )
);
