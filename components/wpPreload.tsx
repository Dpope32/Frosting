import { getWallpapers } from '@/services/s3Service';
import { useWallpaperStore } from '@/store/WallpaperStore';
import * as Sentry from '@sentry/react-native';

export interface WallpaperPreloaderProps {
  onComplete?: () => void;
  primaryColor?: string;
}

export async function preloadWallpapers(onComplete?: () => void) {
  const wallpaperStore = useWallpaperStore.getState();
  
  Sentry.addBreadcrumb({
    category: 'wallpaper',
    message: 'Starting wallpaper preload',
    level: 'info',
  });
  
  try {
    const wallpapers = getWallpapers();
    for (const wallpaper of wallpapers) {
      try {
        const wallpaperKey = wallpaper.name;
        const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
        
        if (!cachedUri) {
          Sentry.addBreadcrumb({
            category: 'wallpaper',
            message: `Caching new wallpaper: ${wallpaperKey}`,
            level: 'info',
          });
          
          await wallpaperStore.cacheWallpaper(wallpaperKey, wallpaper.uri);
        }
      } catch (err) {
        Sentry.captureException(err, {
          extra: {
            wallpaperName: wallpaper.name,
            operation: 'preloadWallpapers_inner',
          },
        });
      }
    }
  } catch (err) {
    Sentry.captureException(err, {
      extra: {
        operation: 'preloadWallpapers_outer',
      },
    });
  } finally {
    if (onComplete) {
      onComplete();
    }
  }
}