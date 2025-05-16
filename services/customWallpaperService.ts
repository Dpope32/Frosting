import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useWallpaperStore } from '@/store';
import { WALLPAPER_CACHE_DIR } from '@/constants/KEYS';

interface UploadResult {
  wallpaperKey: `wallpaper-${string}`;
  uri: string;
}

export class CustomWallpaperService {
  private readonly CUSTOM_WALLPAPER_PREFIX = 'wallpaper-custom-';

  async uploadCustomWallpaper(uri: string): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const wallpaperKey = `${this.CUSTOM_WALLPAPER_PREFIX}${timestamp}` as `wallpaper-${string}`;
      const wallpaperStore = useWallpaperStore.getState();

      if (Platform.OS === 'web') {
        await wallpaperStore.cacheWallpaper(wallpaperKey, uri);
        return { wallpaperKey, uri };
      }

      const localUri = `${WALLPAPER_CACHE_DIR}${wallpaperKey}.jpg`;
      await FileSystem.copyAsync({
        from: uri,
        to: localUri
      });

      await wallpaperStore.cacheWallpaper(wallpaperKey, localUri);
      return { wallpaperKey, uri: localUri };

    } catch (error) {
      console.error('Failed to process custom wallpaper:', error);
      throw new Error('Failed to process custom wallpaper');
    }
  }

  async removeCustomWallpaper(wallpaperKey: `wallpaper-${string}`): Promise<void> {
    if (!wallpaperKey.startsWith(this.CUSTOM_WALLPAPER_PREFIX)) {
      throw new Error('Invalid custom wallpaper key');
    }

    const wallpaperStore = useWallpaperStore.getState();
    await wallpaperStore.clearUnusedWallpapers([wallpaperKey]);
  }

  isCustomWallpaper(wallpaperKey: string): wallpaperKey is `wallpaper-${string}` {
    return wallpaperKey.startsWith(this.CUSTOM_WALLPAPER_PREFIX);
  }
} 