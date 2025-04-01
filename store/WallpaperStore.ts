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
            console.log('[WallpaperStore] Creating wallpaper directory');
            await FileSystem.makeDirectoryAsync(WALLPAPER_CACHE_DIR, {
              intermediates: true,
            });
          } else {
            console.log('[WallpaperStore] Wallpaper directory already exists');
          }
        } catch (error) {
          console.error('[WallpaperStore] Error initializing cache directory:', error);
        }
      },
      
      getCachedWallpaper: async (wallpaperName: string) => {
        const { cache } = get();
        const cachedPath = cache[wallpaperName];
        
        if (!cachedPath) {
          console.log(`[WallpaperStore] No cache entry for ${wallpaperName}`);
          return null;
        }
        
        if (Platform.OS === 'web') {
          console.log(`[WallpaperStore] Web: Using cached URI for ${wallpaperName}: ${cachedPath}`);
          return cachedPath;
        }
        
        try {
          const fileInfo = await FileSystem.getInfoAsync(cachedPath);
          
          if (fileInfo.exists) {
            console.log(`[WallpaperStore] Native: Found cached file for ${wallpaperName}: ${cachedPath}`);
            return cachedPath;
          } else {
            console.log(`[WallpaperStore] Native: Cached file doesn't exist for ${wallpaperName}: ${cachedPath}`);

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
        console.log(`[WallpaperStore] Caching ${wallpaperName} from ${remoteUri}`);
        
        if (Platform.OS === 'web') {
          console.log(`[WallpaperStore] Web: Storing remote URI for ${wallpaperName}`);
          
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
          console.log(`[WallpaperStore] Native: Checking if ${localUri} exists`);
          
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          
          if (fileInfo.exists) {
            console.log(`[WallpaperStore] Native: ${wallpaperName} already exists locally at ${localUri}`);
            
            set((state) => ({
              cache: {
                ...state.cache,
                [wallpaperName]: localUri,
              },
            }));
            
            return;
          }

          console.log(`[WallpaperStore] Native: Downloading ${wallpaperName} from ${remoteUri} to ${localUri}`);
          
          const downloadResult = await FileSystem.downloadAsync(remoteUri, localUri);
          
          if (downloadResult.status !== 200) {
            throw new Error(`Download failed with status ${downloadResult.status}`);
          }
          
          console.log(`[WallpaperStore] Native: Successfully downloaded ${wallpaperName} to ${localUri}`);
          
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
        console.log(`[WallpaperStore] Setting current wallpaper to ${wallpaperName}`);
        set({ currentWallpaper: wallpaperName });
      },
      
      clearUnusedWallpapers: async (keep: string[]) => {
        const { currentWallpaper, cache } = get();
        console.log(`[WallpaperStore] Clearing unused wallpapers, keeping: ${keep.join(', ')}`);
        
        const wallpapersToKeep = [...new Set([...keep, ...(currentWallpaper ? [currentWallpaper] : [])])];
        console.log(`[WallpaperStore] Final wallpapers to keep: ${wallpapersToKeep.join(', ')}`);
        
        if (Platform.OS === 'web') {
          console.log('[WallpaperStore] Web: Clearing unused wallpapers from cache object');
          
          set((state) => ({
            cache: Object.fromEntries(
              Object.entries(state.cache).filter(([key]) => wallpapersToKeep.includes(key))
            ),
          }));
          
          return;
        }
        
        try {
          console.log('[WallpaperStore] Native: Clearing unused wallpaper files');
          
          const dirInfo = await FileSystem.getInfoAsync(WALLPAPER_CACHE_DIR);
          
          if (dirInfo.exists) {
            const files = await FileSystem.readDirectoryAsync(WALLPAPER_CACHE_DIR);
            console.log(`[WallpaperStore] Native: Found ${files.length} files in cache directory`);
            
            for (const file of files) {
              const wallpaperName = file.split('.')[0];
              
              if (!wallpapersToKeep.includes(wallpaperName)) {
                const filePath = `${WALLPAPER_CACHE_DIR}${file}`;
                console.log(`[WallpaperStore] Native: Deleting ${filePath}`);
                
                await FileSystem.deleteAsync(filePath, { idempotent: true });
              } else {
                console.log(`[WallpaperStore] Native: Keeping ${file}`);
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