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
          // Check if file already exists before downloading
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          let finalUri = localUri; // Assume we need to download initially

          if (fileInfo.exists) {
            console.log(`[WallpaperStore] Wallpaper ${wallpaperName} already exists locally at ${localUri}`);
            finalUri = fileInfo.uri; // Use existing file URI
          } else {
             console.log(`[WallpaperStore] Downloading ${wallpaperName} from ${remoteUri} to ${localUri}`);
            const { uri: downloadedUri } = await FileSystem.downloadAsync(remoteUri, localUri);
            finalUri = downloadedUri; // Use the downloaded file URI
          }
          
          set((state) => ({
            cache: {
              ...state.cache,
              [wallpaperName]: finalUri, // Store the final URI (either existing or downloaded)
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
        const { currentWallpaper } = get();
        
        // Always keep the current wallpaper in the cache
        const wallpapersToKeep = [...keep];
        if (currentWallpaper && !wallpapersToKeep.includes(currentWallpaper)) {
          wallpapersToKeep.push(currentWallpaper);
        }
        
        if (Platform.OS === 'web') {
          set((state) => {
            const newCache = { ...state.cache };
            Object.keys(newCache).forEach((key) => {
              if (!wallpapersToKeep.includes(key)) {
                delete newCache[key];
              }
            });
            return { cache: newCache };
          });
          return;
        }

        try {
          // Ensure we have a cache directory
          await get().initializeCache();
          
          const files = await FileSystem.readDirectoryAsync(WALLPAPER_CACHE_DIR);
          await Promise.all(
            files.map(async (file) => {
              if (!wallpapersToKeep.includes(file)) {
                await FileSystem.deleteAsync(`${WALLPAPER_CACHE_DIR}${file}`);
              }
            })
          );

          set((state) => {
            const newCache = { ...state.cache };
            Object.keys(newCache).forEach((key) => {
              if (!wallpapersToKeep.includes(key)) {
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

// Removed redundant web caching logic here - preloading handles this now.
