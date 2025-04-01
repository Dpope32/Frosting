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
    for (const wallpaper of wallpapers) {
      try {
        const wallpaperKey = wallpaper.name;
        const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
        
        if (!cachedUri) {
          await wallpaperStore.cacheWallpaper(wallpaperKey, wallpaper.uri);
        }
      } catch (err) {
        console.error(`[wpPreload] Failed to cache wallpaper ${wallpaper.name}:`, err);
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