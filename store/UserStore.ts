import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { UserPreferences } from '@/types'
import * as Sentry from '@sentry/react-native';
import { addSyncLog } from '@/components/sync/syncUtils';

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
  showQuoteOnHome: false,
  portfolioEnabled: true,
  temperatureEnabled: true,
  wifiEnabled: true,
  showNBAGamesInCalendar: false,
  showNBAGameTasks: false, 
  permissionsExplained: false,
  premium: false,
  calendarPermission: false,
};

const getUserAccess = (premium: boolean, username: string): 'premium' | 'none' => {
  if (premium) return 'premium';
  return 'none';
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      hydrated: false,
      setPreferences: (newPrefs) => {
        if (newPrefs.premium !== undefined) {
          addSyncLog(`🗄️ [UserStore] Premium flag being set to: ${newPrefs.premium}`, 'info');
        }
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
        
        return getUserAccess(premium, username);
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
        } else {
          console.log('🗄️ [UserStore] No state to hydrate from storage');
        }
      },
    }
  )
);
