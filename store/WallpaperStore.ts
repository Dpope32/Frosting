import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { createPersistStorage } from './AsyncStorage';

interface WallpaperCacheEntry {
  uri: string;
  version: string;
  lastAccessed: number;
  checksum?: string;
}

interface WallpaperCache {
  [key: string]: WallpaperCacheEntry; 
}

interface PersistedWallpaperState {
  cache: WallpaperCache;
  currentWallpaper: string | null;
  schemaVersion?: number;
}

interface WallpaperStore extends PersistedWallpaperState {
  initializeCache: () => Promise<void>;
  getCachedWallpaper: (wallpaperName: string) => Promise<string | null>;
  cacheWallpaper: (wallpaperName: string, uri: string) => Promise<void>;
  setCurrentWallpaper: (wallpaperName: string) => void;
  clearUnusedWallpapers: (keep: string[]) => Promise<void>;
}

const WALLPAPER_CACHE_DIR = Platform.OS !== 'web' 
  ? `${FileSystem.cacheDirectory || ''}wallpapers/` 
  : '';

export const useWallpaperStore = create<WallpaperStore>()(
  persist(
    (set, get) => ({
      cache: {},
      currentWallpaper: null,
      schemaVersion: 1,
      
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
        const entry = cache[wallpaperName];
        if (!entry) { return null }
        
        // Update last accessed time
        set((state) => ({
          cache: {
            ...state.cache,
            [wallpaperName]: {
              ...entry,
              lastAccessed: Date.now()
            }
          }
        }));

        if (Platform.OS === 'web') { return entry.uri; }
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(entry.uri);
          if (fileInfo.exists) {
            return entry.uri;
          } else {
            set((state) => ({
              cache: Object.fromEntries(
                Object.entries(state.cache).filter(([key]) => key !== wallpaperName)
              )
            }));
            return null;
          }
        } catch (error) {
          console.error(`[WallpaperStore] Error checking cached file for ${wallpaperName}:`, error);
          return null;
        }
      },
      cacheWallpaper: async (wallpaperName: string, remoteUri: string) => {
        const newEntry: WallpaperCacheEntry = {
          uri: remoteUri,
          version: '1.0',
          lastAccessed: Date.now()
        };

        if (Platform.OS === 'web') {
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: newEntry,
            },
          }));
          return;
        }
        
        try {
          await get().initializeCache();
          const localUri = `${WALLPAPER_CACHE_DIR}${wallpaperName}.jpg`;
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          
          if (fileInfo.exists) {
            set((state) => ({
              cache: {
                ...state.cache,
                [wallpaperName]: {
                  ...newEntry,
                  uri: localUri
                },
              },
            }));
            return;
          }

          const downloadResult = await FileSystem.downloadAsync(remoteUri, localUri);
          if (downloadResult.status !== 200) {
            throw new Error(`Download failed with status ${downloadResult.status}`);
          }
          
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: {
                ...newEntry,
                uri: localUri
              },
            },
          }));
        } catch (error) {
          console.error(`[WallpaperStore] Error caching wallpaper ${wallpaperName}:`, error);
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: newEntry,
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
    }),
    {
      name: 'wallpaper-cache',
      storage: createPersistStorage<PersistedWallpaperState>(2),
      partialize: (state) => {
        const { cache, currentWallpaper, schemaVersion } = state;
        return { cache, currentWallpaper, schemaVersion };
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
