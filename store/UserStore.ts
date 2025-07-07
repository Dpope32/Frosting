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
        
        // Enhanced sync logging for profile picture changes
        if (newPrefs.profilePicture !== undefined) {
          const currentProfilePicture = get().preferences.profilePicture;
          
          // Log profile picture changes with detailed info
          if (currentProfilePicture !== newPrefs.profilePicture) {
            addSyncLog(
              `👤 [UserStore] Profile picture changing from "${currentProfilePicture || 'none'}" to "${newPrefs.profilePicture || 'none'}"`,
              'info',
              `Previous: ${currentProfilePicture || 'null'} | New: ${newPrefs.profilePicture || 'null'} | Type: ${typeof newPrefs.profilePicture}`
            );
            
            // Check if the new profile picture is a file:// URI that might be in cache
            if (newPrefs.profilePicture && typeof newPrefs.profilePicture === 'string') {
              if (newPrefs.profilePicture.includes('/cache/') || newPrefs.profilePicture.includes('cacheDirectory')) {
                addSyncLog(
                  `⚠️ [UserStore] WARNING: Profile picture uses cache directory - this may cause disappearing images!`,
                  'warning',
                  `URI: ${newPrefs.profilePicture} | Consider migrating to documentDirectory for persistence`
                );
              } else if (newPrefs.profilePicture.includes('/Documents/') || newPrefs.profilePicture.includes('documentDirectory')) {
                addSyncLog(
                  `✅ [UserStore] Profile picture uses persistent document directory`,
                  'success',
                  `URI: ${newPrefs.profilePicture}`
                );
              } else if (newPrefs.profilePicture.startsWith('http')) {
                addSyncLog(
                  `🌐 [UserStore] Profile picture is remote URL`,
                  'info',
                  `URL: ${newPrefs.profilePicture}`
                );
              } else if (newPrefs.profilePicture.startsWith('file://')) {
                addSyncLog(
                  `📁 [UserStore] Profile picture is local file URI`,
                  'info',
                  `URI: ${newPrefs.profilePicture}`
                );
              }
            } else if (newPrefs.profilePicture === null || newPrefs.profilePicture === '') {
              addSyncLog(
                `🗑️ [UserStore] Profile picture being cleared/removed`,
                'info',
                `New value: ${newPrefs.profilePicture}`
              );
            }
          }
        }
        
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPrefs,
          },
        }));
      },
      clearPreferences: () => {
        addSyncLog('🗄️ [UserStore] Clearing all preferences including profile picture', 'warning');
        set({
          preferences: defaultPreferences,
        });
      },
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
          
          // Enhanced profile picture hydration logging
          if (state.preferences.profilePicture) {
            const profilePicture = state.preferences.profilePicture;
            
            // Check for potential cache directory issues during hydration
            if (profilePicture.includes('/cache/') || profilePicture.includes('cacheDirectory')) {
              addSyncLog(
                `⚠️ [UserStore] Profile picture uses cache directory - may disappear after iOS cache clearing!`,
                'warning',
                `URI: ${profilePicture}`
              );
              Sentry.captureException(new Error('User profile picture stored in volatile cache directory'));
            }
          } else {
            addSyncLog(
              `👤 [UserStore] No profile picture found during hydration`,
              'verbose',
              `Profile picture value: ${state.preferences.profilePicture}`
            );
          }
        } else {
          addSyncLog('🗄️ [UserStore] No state to hydrate from storage', 'warning');
        }
      },
    }
  )
);
