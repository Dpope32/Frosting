import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { createPersistStorage } from './AsyncStorage';
import * as Sentry from '@sentry/react-native';
import { getWallpapers } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { WALLPAPER_DIR, LAST_APP_VERSION_KEY } from '@/constants';
import { addSyncLog } from '@/components/sync/syncUtils';

const IS_TEST = typeof (globalThis as any).jest !== 'undefined' || 
                process.env.NODE_ENV === 'test' || 
                typeof jest !== 'undefined';

interface WallpaperCache {
  [key: string]: string; 
}

interface PersistedWallpaperState {
  cache: WallpaperCache;
  currentWallpaper: string | null;
}

interface WallpaperStore extends PersistedWallpaperState {
  initializeCache: () => Promise<void>;
  getCachedWallpaper: (wallpaperName: string) => Promise<string | null>;
  cacheWallpaper: (wallpaperName: string, uri: string) => Promise<void>;
  setCurrentWallpaper: (wallpaperName: string) => void;
  clearUnusedWallpapers: (keep: string[]) => Promise<void>;
  checkAndRedownloadWallpapers: () => Promise<void>;
  migrateFromCacheToDocuments: () => Promise<void>;
}

export const useWallpaperStore = create<WallpaperStore>()(
  persist(
    (set, get) => ({
      cache: {},
      currentWallpaper: null,
      
      initializeCache: async () => {
        if (IS_TEST || Platform.OS === 'web') return;

        try {
          const dirInfo = await FileSystem.getInfoAsync(WALLPAPER_DIR);
          
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(WALLPAPER_DIR, {
              intermediates: true,
            });
          } else {
          }
        } catch (error) {
          addSyncLog('❌ [WallpaperStore] Error initializing cache directory', 'error', error instanceof Error ? error.message : String(error));
          if (!IS_TEST) console.error('[WallpaperStore] Error initializing cache directory:', error);
          throw error;
        }
      },

      migrateFromCacheToDocuments: async () => {
        if (IS_TEST || Platform.OS === 'web') return;

        try {
          
          const oldCacheDir = `${FileSystem.cacheDirectory}wallpapers/`;
          const newDocDir = WALLPAPER_DIR;
          
          // Check if old cache directory exists
          const oldDirInfo = await FileSystem.getInfoAsync(oldCacheDir);
          if (!oldDirInfo.exists) {
            return;
          }
          
          // Ensure new document directory exists
          await get().initializeCache();
          
          // Get current cache state
          const { cache } = get();
          const updatedCache: Record<string, string> = {};
          let migratedCount = 0;
          let errorCount = 0;
          
          // Get files from old cache directory
          const files = await FileSystem.readDirectoryAsync(oldCacheDir);
          addSyncLog(`📁 [WallpaperStore] Found ${files.length} files in old cache directory`, 'info');
          
          // Migrate files and update paths
          for (const file of files) {
            const oldPath = `${oldCacheDir}${file}`;
            const newPath = `${newDocDir}${file}`;
            
            try {
              // Check if file exists in old location
              const oldFileInfo = await FileSystem.getInfoAsync(oldPath);
              if (oldFileInfo.exists) {
                // Copy to new location
                await FileSystem.copyAsync({ from: oldPath, to: newPath });
                
                // Update cache entries
                const wallpaperName = file.replace('.jpg', '');
                if (cache[wallpaperName] && cache[wallpaperName] === oldPath) {
                  updatedCache[wallpaperName] = newPath;
                  migratedCount++;
                }
              }
            } catch (error) {
              addSyncLog(`❌ [WallpaperStore] Failed to migrate ${file}`, 'warning', error instanceof Error ? error.message : String(error));
              errorCount++;
            }
          }
          
          // Update store with new paths
          if (Object.keys(updatedCache).length > 0) {
            set((state) => ({ 
              cache: { ...state.cache, ...updatedCache } 
            }));
          }
          
          // Clean up old cache directory
          try {
            await FileSystem.deleteAsync(oldCacheDir, { idempotent: true });
          } catch (error) {
            addSyncLog('⚠️ [WallpaperStore] Failed to clean up old cache directory', 'warning', error instanceof Error ? error.message : String(error));
          }
          
        } catch (error) {
          addSyncLog('❌ [WallpaperStore] Migration failed', 'error', error instanceof Error ? error.message : String(error));
          if (!IS_TEST) console.error('[WallpaperStore] Migration failed:', error);
        }
      },
      
      getCachedWallpaper: async (wallpaperName: string) => {
        const { cache } = get();
        const cachedPath = cache[wallpaperName];
        
        if (!cachedPath) {
          Sentry.addBreadcrumb({
            category: 'wallpaper',
            message: `No cached path found for wallpaper: ${wallpaperName}`,
            level: 'info',
          });
          return null;
        }
        
        if (Platform.OS === 'web') { 
          return cachedPath; 
        }
        
        // Only local file URIs are valid for FileSystem.getInfoAsync; treat others as missing
        if (typeof cachedPath === 'string' && !cachedPath.startsWith('file://')) {
          addSyncLog(`⚠️ [WallpaperStore] Cached path is not a file URI; treating as missing`, 'warning', cachedPath);
          return null;
        }

        try {
          const fileInfo = await FileSystem.getInfoAsync(cachedPath);
          if (fileInfo.exists) {
            return cachedPath;
          } else {
            
            Sentry.captureMessage(`Wallpaper file missing despite cache entry: ${wallpaperName}`, {
              level: 'warning',
              extra: {
                cachedPath,
                wallpaperName,
                cacheState: cache,
              },
            });
            
            // Remove invalid cache entry
            set((state) => ({
              cache: Object.fromEntries(
                Object.entries(state.cache).filter(([key]) => key !== wallpaperName)
              )
            }));
            
            return null;
          }
        } catch (error) {
          addSyncLog(`❌ [WallpaperStore] Error checking wallpaper file ${wallpaperName}`, 'error', error instanceof Error ? error.message : String(error));
          Sentry.captureException(error, {
            extra: {
              wallpaperName,
              cachedPath,
              operation: 'getCachedWallpaper',
            },
          });
          return null;
        }
      },
      
      cacheWallpaper: async (wallpaperName: string, remoteUri: string) => {
        if (Platform.OS === 'web') {
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: remoteUri,
            },
          }));
          return;
        }
        
        try {
          await get().initializeCache();
          
          const localUri = `${WALLPAPER_DIR}${wallpaperName}.jpg`;
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          
          if (!fileInfo.exists) {
            
            Sentry.addBreadcrumb({
              category: 'wallpaper',
              message: `Downloading wallpaper: ${wallpaperName}`,
              level: 'info',
              data: {
                remoteUri,
                localUri,
              },
            });
            
            const downloadResult = await FileSystem.downloadAsync(remoteUri, localUri);
            
            if (downloadResult.status !== 200) {
              throw new Error(`Download failed with status ${downloadResult.status}`);
            }
            
          } else {
          }
          
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: localUri,
            },
          }));
          
        } catch (error) {
          addSyncLog(`❌ [WallpaperStore] Failed to cache wallpaper ${wallpaperName}`, 'error', error instanceof Error ? error.message : String(error));
          
          Sentry.captureException(error, {
            extra: {
              wallpaperName,
              remoteUri,
              operation: 'cacheWallpaper',
            },
          });
          
          // Fallback to remote URI as before
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: remoteUri,
            },
          }));
          
        }
      },
      
      setCurrentWallpaper: (wallpaperName: string) => {
        set({ currentWallpaper: wallpaperName });
      },
      
      clearUnusedWallpapers: async (keep: string[]) => {
        const { currentWallpaper, cache } = get();
        
        const wallpapersToKeep = [...new Set([...keep, ...(currentWallpaper ? [currentWallpaper] : [])])];
        
        if (Platform.OS === 'web') {
          set((state) => ({
            cache: Object.fromEntries(
              Object.entries(state.cache).filter(([key]) => wallpapersToKeep.includes(key))
            ),
          }));
          return;
        }
        
        try {
          const dirInfo = await FileSystem.getInfoAsync(WALLPAPER_DIR);
          let removedCount = 0;
          
          if (dirInfo.exists) {
            const files = await FileSystem.readDirectoryAsync(WALLPAPER_DIR);
            
            for (const file of files) {
              const wallpaperName = file.split('.')[0];
              if (!wallpapersToKeep.includes(wallpaperName)) {
                const filePath = `${WALLPAPER_DIR}${file}`;
                await FileSystem.deleteAsync(filePath, { idempotent: true });
                removedCount++;
              }
            }
          }

          set((state) => ({
            cache: Object.fromEntries(
              Object.entries(state.cache).filter(([key]) => wallpapersToKeep.includes(key))
            ),
          }));
          
        } catch (error) {
          if (!IS_TEST) console.error('[WallpaperStore] Error clearing unused wallpapers:', error);
        }
      },
      
      checkAndRedownloadWallpapers: async () => {
        if (IS_TEST || Platform.OS === 'web') return;
        
        try {
          
          // Get the current app version
          const currentVersion = Constants.expoConfig?.version || '1.0.0';
          
          // Get the last app version we checked from AsyncStorage (not from state)
          const lastVersion = await AsyncStorage.getItem(LAST_APP_VERSION_KEY);
          
          // If this is the first time or the app has been updated, redownload wallpapers
          if (!lastVersion || lastVersion !== currentVersion) {
            addSyncLog(`📱 [WallpaperStore] App version changed from ${lastVersion || 'none'} to ${currentVersion}, checking wallpapers`, 'info');
            
            Sentry.addBreadcrumb({
              category: 'wallpaper',
              message: `App version changed from ${lastVersion || 'none'} to ${currentVersion}, checking wallpapers`,
              level: 'info',
            });
            
            // Update the last version in AsyncStorage
            await AsyncStorage.setItem(LAST_APP_VERSION_KEY, currentVersion);
            
            // Get all available wallpapers
            const wallpapers = getWallpapers();
            const { cache } = get();
            let redownloadedCount = 0;
            
            
            // Check each wallpaper
            for (const wallpaper of wallpapers) {
              const wallpaperKey = wallpaper.name;
              const cachedPath = cache[wallpaperKey];
              
              // If we don't have this wallpaper cached or the file doesn't exist, download it
              if (!cachedPath) {
                
                Sentry.addBreadcrumb({
                  category: 'wallpaper',
                  message: `Redownloading missing wallpaper: ${wallpaperKey}`,
                  level: 'info',
                });
                
                await get().cacheWallpaper(wallpaperKey, wallpaper.uri);
                redownloadedCount++;
              } else {
                // If cached path is not a local file, re-cache to documents and skip file check
                if (typeof cachedPath === 'string' && !cachedPath.startsWith('file://')) {
                  addSyncLog(`📥 [WallpaperStore] Cached path is remote; redownloading to local file`, 'info', cachedPath);
                  await get().cacheWallpaper(wallpaperKey, wallpaper.uri);
                  redownloadedCount++;
                } else {
                  try {
                    const fileInfo = await FileSystem.getInfoAsync(cachedPath);
                    if (!fileInfo.exists) {
                      addSyncLog(`📥 [WallpaperStore] Redownloading missing file for wallpaper: ${wallpaperKey}`, 'info');
                      
                      Sentry.addBreadcrumb({
                        category: 'wallpaper',
                        message: `Redownloading missing file for wallpaper: ${wallpaperKey}`,
                        level: 'info',
                      });
                      
                      await get().cacheWallpaper(wallpaperKey, wallpaper.uri);
                      redownloadedCount++;
                    }
                  } catch (error) {
                    addSyncLog(`❌ [WallpaperStore] Error checking wallpaper ${wallpaperKey}`, 'error', error instanceof Error ? error.message : String(error));
                    Sentry.captureException(error, {
                      extra: {
                        wallpaperKey,
                        cachedPath,
                        operation: 'checkAndRedownloadWallpapers',
                      },
                    });
                  }
                }
              }
            }
            
          } else {
          }
        } catch (error) {
          addSyncLog(`❌ [WallpaperStore] Error in checkAndRedownloadWallpapers`, 'error', error instanceof Error ? error.message : String(error));
          Sentry.captureException(error, {
            extra: {
              operation: 'checkAndRedownloadWallpapers',
            },
          });
        }
      },
    }),
    {
      name: 'wallpaper-cache',
      storage: createPersistStorage<PersistedWallpaperState>(3), // Incremented version for migration
      partialize: (state) => {
        const { cache, currentWallpaper } = state;
        return { cache, currentWallpaper };
      },
      migrate: (persistedState, version) => {
        const state = persistedState as PersistedWallpaperState;
        
        // Version 0 had no structure - reset completely
        if (version === 0) {
          return {
            cache: {},
            currentWallpaper: null
          };
        }

        // Version 1-2 to 3: Migration from cache to documents directory will happen in onRehydrateStorage
        if (version <= 2) {
          addSyncLog('🔄 [WallpaperStore] Migrating to version 3 - cache to documents migration will run', 'info');
        }

        // For any version > 0, preserve what we can
        return {
          cache: state.cache || {},
          currentWallpaper: state.currentWallpaper || null
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state || IS_TEST) return;
        
        setTimeout(() => {
          state.migrateFromCacheToDocuments();
        }, 1000);
        
        setTimeout(() => {
          state.checkAndRedownloadWallpapers();
        }, 2000);
      }
    }
  )
);

//if (Platform.OS !== 'web') {
//  useWallpaperStore.getState().initializeCache().catch(error => {
//    console.error('[WallpaperStore] Failed to initialize cache:', error);
//  });
//}
