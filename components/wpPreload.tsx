import { getWallpapers } from '@/services/s3Service';
import { useWallpaperStore } from '@/store/WallpaperStore';
import { Platform } from 'react-native';

export interface WallpaperPreloaderProps {
  onComplete?: () => void;
  primaryColor?: string;
}

export async function preloadWallpapers(onComplete?: () => void) {
  console.log('[wpPreload] Starting wallpaper preload');
  const wallpaperStore = useWallpaperStore.getState();
  
  try {
    const wallpapers = getWallpapers();
    console.log(`[wpPreload] Retrieved ${wallpapers.length} wallpapers to cache`);
    
    // Process wallpapers in sequence to avoid overwhelming the device
    for (const wallpaper of wallpapers) {
      try {
        // IMPORTANT: Do not add another "wallpaper-" prefix here
        // The S3Service already returns names like "wallpaper-Abstract"
        const wallpaperKey = wallpaper.name;
        
        // Check if already cached
        const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
        
        if (!cachedUri) {
          console.log(`[wpPreload] Caching ${wallpaperKey} from ${wallpaper.uri}`);
          await wallpaperStore.cacheWallpaper(wallpaperKey, wallpaper.uri);
        } else {
          console.log(`[wpPreload] Already cached: ${wallpaperKey} - ${cachedUri}`);
        }
      } catch (err) {
        console.error(`[wpPreload] Failed to cache wallpaper ${wallpaper.name}:`, err);
      }
    }
    
    console.log('[wpPreload] Completed preloading wallpapers');
  } catch (err) {
    console.error('[wpPreload] Error in preloadWallpapers:', err);
  } finally {
    if (onComplete) {
      console.log('[wpPreload] Calling onComplete callback');
      onComplete();
    }
  }
}