import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { createPersistStorage } from './AsyncStorage';
import * as Sentry from '@sentry/react-native';
import { getWallpapers } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { WALLPAPER_CACHE_DIR, LAST_APP_VERSION_KEY } from '@/constants/KEYS';

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
}

export const useWallpaperStore = create<WallpaperStore>()(
  persist(
    (set, get) => ({
      cache: {},
      currentWallpaper: null,
      
      initializeCache: async () => {
        if (Platform.OS === 'web') return;

        try {
          const dirInfo = await FileSystem.getInfoAsync(WALLPAPER_CACHE_DIR);
          
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(WALLPAPER_CACHE_DIR, {
              intermediates: true,
            });
          } else {
          }
        } catch (error) {
          console.error('[WallpaperStore] Error initializing cache directory:', error);
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
        
        if (Platform.OS === 'web') { return cachedPath; }
        
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
            
            set((state) => ({
              cache: Object.fromEntries(
                Object.entries(state.cache).filter(([key]) => key !== wallpaperName)
              )
            }));
            return null;
          }
        } catch (error) {
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
          
          const localUri = `${WALLPAPER_CACHE_DIR}${wallpaperName}.jpg`;
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
          }
          
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: localUri,
            },
          }));
        } catch (error) {
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
          const dirInfo = await FileSystem.getInfoAsync(WALLPAPER_CACHE_DIR);
          
          if (dirInfo.exists) {
            const files = await FileSystem.readDirectoryAsync(WALLPAPER_CACHE_DIR);
            
            for (const file of files) {
              const wallpaperName = file.split('.')[0];
              if (!wallpapersToKeep.includes(wallpaperName)) {
                const filePath = `${WALLPAPER_CACHE_DIR}${file}`;
                await FileSystem.deleteAsync(filePath, { idempotent: true });
              } else {
              }
            }
          }

          set((state) => ({
            cache: Object.fromEntries(
              Object.entries(state.cache).filter(([key]) => wallpapersToKeep.includes(key))
            ),
          }));
        } catch (error) {
          console.error('[WallpaperStore] Error clearing unused wallpapers:', error);
        }
      },
      
      checkAndRedownloadWallpapers: async () => {
        if (Platform.OS === 'web') return;
        
        try {
          // Get the current app version
          const currentVersion = Constants.expoConfig?.version || '1.0.0';
          
          // Get the last app version we checked from AsyncStorage (not from state)
          const lastVersion = await AsyncStorage.getItem(LAST_APP_VERSION_KEY);
          
          // If this is the first time or the app has been updated, redownload wallpapers
          if (!lastVersion || lastVersion !== currentVersion) {
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
              } else {
                try {
                  const fileInfo = await FileSystem.getInfoAsync(cachedPath);
                  if (!fileInfo.exists) {
                    Sentry.addBreadcrumb({
                      category: 'wallpaper',
                      message: `Redownloading missing file for wallpaper: ${wallpaperKey}`,
                      level: 'info',
                    });
                    
                    await get().cacheWallpaper(wallpaperKey, wallpaper.uri);
                  }
                } catch (error) {
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
        } catch (error) {
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
      storage: createPersistStorage<PersistedWallpaperState>(2),
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

        // For any version > 0, preserve what we can
        return {
          cache: state.cache || {},
          currentWallpaper: state.currentWallpaper || null
        };
      },
    }
  )
);

if (Platform.OS !== 'web') {
  useWallpaperStore.getState().initializeCache().catch(error => {
    console.error('[WallpaperStore] Failed to initialize cache:', error);
  });
}
