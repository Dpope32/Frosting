 import { getWallpapers } from '@/services/s3Service';
import { useWallpaperStore } from '@/store/WallpaperStore';

export interface WallpaperPreloaderProps {
  onComplete?: () => void;
  primaryColor?: string;
}

export async function preloadWallpapers(onComplete?: () => void) {
  const wallpaperStore = useWallpaperStore.getState();
  
  try {
    const wallpapers = getWallpapers();
    const MAX_RETRIES = 3;
    
    for (const wallpaper of wallpapers) {
      let retryCount = 0;
      let success = false;
      
      while (retryCount < MAX_RETRIES && !success) {
        try {
          const wallpaperKey = wallpaper.name;
          const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
          
          if (!cachedUri) {
            await wallpaperStore.cacheWallpaper(wallpaperKey, wallpaper.uri);
          }
          
          // Verify the wallpaper was cached successfully
          const verifiedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
          if (verifiedUri) {
            success = true;
          } else {
            throw new Error('Caching verification failed');
          }
        } catch (err) {
          retryCount++;
          if (retryCount >= MAX_RETRIES) {
            console.error(`[wpPreload] Failed to cache wallpaper ${wallpaper.name} after ${MAX_RETRIES} attempts:`, err);
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
    }
  } catch (err) {
    console.error('[wpPreload] Error in preloadWallpapers:', err);
  } finally {
    if (onComplete) {
      onComplete();
    }
  }
}
