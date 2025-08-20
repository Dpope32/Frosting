import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createPersistStorage } from './AsyncStorage'
import { UserPreferences } from '@/types'
import * as Sentry from '@sentry/react-native';
import { addSyncLog } from '@/components/sync/syncUtils';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface UserStore {
	preferences: UserPreferences;
	setPreferences: (prefs: Partial<UserPreferences>) => void;
	clearPreferences: () => void;
	hydrated: boolean;
	get syncAccess(): string;

	// Migration/validation helpers
	ensureProfileDir: () => Promise<void>;
	migrateProfilePictureFromCacheToDocuments: () => Promise<void>;
	validateProfilePicture: () => Promise<void>;
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

const IS_TEST = typeof (globalThis as any).jest !== 'undefined' || process.env.NODE_ENV === 'test' || typeof jest !== 'undefined';
const getUserAccess = (premium: boolean, username: string): 'premium' | 'none' => {
	if (premium) return 'premium';
	return 'none';
};

// Local persistent directory for the user's profile assets (mirrors WallpaperStore approach)
const PROFILE_DIR = `${FileSystem.documentDirectory}profile/`;

export const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			preferences: defaultPreferences,
			hydrated: false,

			ensureProfileDir: async () => {
				if (IS_TEST || Platform.OS === 'web') return;
				try {
					const dirInfo = await FileSystem.getInfoAsync(PROFILE_DIR);
					if (!dirInfo.exists) {
						await FileSystem.makeDirectoryAsync(PROFILE_DIR, { intermediates: true });
						addSyncLog('📁 [UserStore] Created profile directory', 'info');
					}
				} catch (error) {
					addSyncLog('❌ [UserStore] Error ensuring profile directory', 'error', error instanceof Error ? error.message : String(error));
					if (!IS_TEST) console.error('[UserStore] Error ensuring profile directory:', error);
				}
			},

			migrateProfilePictureFromCacheToDocuments: async () => {
				if (IS_TEST || Platform.OS === 'web') return;

				try {
					const current = get().preferences.profilePicture;
					if (!current || typeof current !== 'string') return;

					const isCacheBased =
						current.includes('/cache/') ||
						current.includes('cacheDirectory') ||
						(!!FileSystem.cacheDirectory && current.startsWith(FileSystem.cacheDirectory!));

					// Only migrate if it lives in the volatile cache
					if (!isCacheBased) return;

					await get().ensureProfileDir();

					// Derive an extension if present, default to jpg
					const name = 'pfp';
					const rawExt = current.split('.').pop() || 'jpg';
					const ext = (rawExt.split('?')[0] || 'jpg').toLowerCase();
					const targetPath = `${PROFILE_DIR}${name}.${ext}`;

					const oldInfo = await FileSystem.getInfoAsync(current);
					if (!oldInfo.exists) {
						addSyncLog('⚠️ [UserStore] Cache-based profile picture path no longer exists; clearing reference', 'warning', current);
						set((state) => ({ preferences: { ...state.preferences, profilePicture: undefined as any } }));
						Sentry.captureMessage('Profile picture missing during migration from cache', { level: 'warning' });
						return;
					}

					// Copy to persistent documents dir
					await FileSystem.copyAsync({ from: current, to: targetPath });
					addSyncLog(`✅ [UserStore] Migrated profile picture from cache to documents`, 'success', `from: ${current} -> to: ${targetPath}`);

					// Update preference to point to new location
					set((state) => ({
						preferences: { ...state.preferences, profilePicture: targetPath as any },
					}));

					// Best-effort cleanup
					try {
						await FileSystem.deleteAsync(current, { idempotent: true });
						addSyncLog('🧹 [UserStore] Cleaned up old cache profile picture', 'info');
					} catch (cleanupErr) {
						addSyncLog('⚠️ [UserStore] Failed to delete old cache profile picture (non-fatal)', 'warning', cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr));
					}
				} catch (error) {
					addSyncLog('❌ [UserStore] Migration of profile picture from cache failed', 'error', error instanceof Error ? error.message : String(error));
					Sentry.captureException(error, { extra: { operation: 'migrateProfilePictureFromCacheToDocuments' } });
				}
			},

			validateProfilePicture: async () => {
				if (IS_TEST || Platform.OS === 'web') return;

				try {
					const current = get().preferences.profilePicture;
					if (!current || typeof current !== 'string') {
						addSyncLog(`👤 [UserStore] No profile picture set during validation`, 'verbose');
						return;
					}

					// Skip remote URLs; we don't manage them locally
					if (current.startsWith('http')) {
						addSyncLog(`🌐 [UserStore] Profile picture is remote URL, validation skipped`, 'verbose', current);
						return;
					}

					const info = await FileSystem.getInfoAsync(current);
					if (!info.exists) {
						addSyncLog('⚠️ [UserStore] Profile picture path missing on disk; clearing reference', 'warning', current);
						Sentry.captureMessage('Profile picture missing on disk during validation', {
							level: 'warning',
							extra: { current },
						});
						set((state) => ({
							preferences: { ...state.preferences, profilePicture: undefined as any },
						}));
					} else {
						addSyncLog('✅ [UserStore] Profile picture validated on disk', 'info', current);
					}
				} catch (error) {
					addSyncLog('❌ [UserStore] Error validating profile picture', 'error', error instanceof Error ? error.message : String(error));
					Sentry.captureException(error, { extra: { operation: 'validateProfilePicture' } });
				}
			},

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

					// Post-hydration checks and migrations (mirrors WallpaperStore scheduling)
					setTimeout(() => {
						state.ensureProfileDir();
					}, 500);
					
					setTimeout(() => {
						state.migrateProfilePictureFromCacheToDocuments();
					}, 1000);

					setTimeout(() => {
						state.validateProfilePicture();
					}, 2000);
					
					// Enhanced profile picture hydration logging
					if (state.preferences.profilePicture) {
						const profilePicture = state.preferences.profilePicture;
						
						// Check for potential cache directory issues during hydration
						if (typeof profilePicture === 'string' && (profilePicture.includes('/cache/') || profilePicture.includes('cacheDirectory'))) {
							addSyncLog(
								`⚠️ [UserStore] Profile picture uses cache directory - may disappear after iOS cache clearing!`,
								'warning',
								`URI: ${profilePicture}`
							);
							Sentry.captureException(new Error('User profile picture stored in volatile cache directory'));
						} else {
							addSyncLog(`👤 [UserStore] Hydrated profile picture reference`, 'info', String(profilePicture));
						}
					} else {
						addSyncLog(
							`👤 [UserStore] No profile picture found during hydration`,
							'verbose',
							`Profile picture value: ${String(state.preferences.profilePicture)}`
						);
					}
				} else {
					addSyncLog('🗄️ [UserStore] No state to hydrate from storage', 'warning');
				}
			},
		}
	)
);