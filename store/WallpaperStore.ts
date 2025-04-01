import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { createPersistStorage } from './AsyncStorage';

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
}

const WALLPAPER_CACHE_DIR = Platform.OS !== 'web' 
  ? `${FileSystem.cacheDirectory || ''}wallpapers/` 
  : '';

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
        if (!cachedPath) { return null }
        if (Platform.OS === 'web') { return cachedPath; }
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(cachedPath);
          if (fileInfo.exists) {
            return cachedPath;
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
          
          if (fileInfo.exists) {
            
            set((state) => ({
              cache: {
                ...state.cache,
                [wallpaperName]: localUri,
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
              [wallpaperName]: localUri,
            },
          }));
        } catch (error) {
          console.error(`[WallpaperStore] Error caching wallpaper ${wallpaperName}:`, error);
          
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
    }),
    {
      name: 'wallpaper-cache',
      storage: createPersistStorage<PersistedWallpaperState>(),
      partialize: (state) => {
        const { cache, currentWallpaper } = state;
        return { cache, currentWallpaper };
      },
    }
  )
);

if (Platform.OS !== 'web') {
  useWallpaperStore.getState().initializeCache().catch(error => {
    console.error('[WallpaperStore] Failed to initialize cache:', error);
  });
}