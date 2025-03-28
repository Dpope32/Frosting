import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { getWallpapers } from '@/services/s3Service';
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
  clearUnusedWallpapers: (keep: string[]) => void;
}

const WALLPAPER_CACHE_DIR = `${FileSystem.cacheDirectory}wallpapers/`;

export const useWallpaperStore = create<WallpaperStore>()(
    persist(
    (set, get) => ({
      cache: {},
      currentWallpaper: null,
      initializeCache: async () => {
        if (Platform.OS === 'web') return;

        // Ensure cache directory exists
        await FileSystem.makeDirectoryAsync(WALLPAPER_CACHE_DIR, {
          intermediates: true,
        });
      },
      getCachedWallpaper: async (wallpaperName: string) => {
        const { cache } = get();
        return cache[wallpaperName] || null;
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
          const localUri = `${WALLPAPER_CACHE_DIR}${wallpaperName}`;
          const { uri } = await FileSystem.downloadAsync(remoteUri, localUri);
          
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: uri,
            },
          }));
        } catch (error) {
          console.error('Failed to cache wallpaper:', error);
        }
      },
      setCurrentWallpaper: (wallpaperName: string) => {
        set({ currentWallpaper: wallpaperName });
      },
      clearUnusedWallpapers: async (keep: string[]) => {
        if (Platform.OS === 'web') {
          set((state) => {
            const newCache = { ...state.cache };
            Object.keys(newCache).forEach((key) => {
              if (!keep.includes(key)) {
                delete newCache[key];
              }
            });
            return { cache: newCache };
          });
          return;
        }

        try {
          const files = await FileSystem.readDirectoryAsync(WALLPAPER_CACHE_DIR);
          await Promise.all(
            files.map(async (file) => {
              if (!keep.includes(file)) {
                await FileSystem.deleteAsync(`${WALLPAPER_CACHE_DIR}${file}`);
              }
            })
          );

          set((state) => {
            const newCache = { ...state.cache };
            Object.keys(newCache).forEach((key) => {
              if (!keep.includes(key)) {
                delete newCache[key];
              }
            });
            return { cache: newCache };
          });
        } catch (error) {
          console.error('Failed to clear unused wallpapers:', error);
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
  useWallpaperStore.getState().initializeCache();
}

if (Platform.OS === 'web') {
  const wallpapers = getWallpapers();
  wallpapers.forEach((wallpaper) => {
    const wallpaperName = wallpaper.name.split('.')[0];
    useWallpaperStore.getState().cacheWallpaper(
      `wallpaper-${wallpaperName}`,
      wallpaper.uri
    );
  });
}
