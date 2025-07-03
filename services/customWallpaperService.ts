import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useWallpaperStore } from '@/store';
import { WALLPAPER_DIR } from '@/constants';
import { addSyncLog } from '@/components/sync/syncUtils';

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

      addSyncLog(`📤 [CustomWallpaperService] Starting upload of custom wallpaper: ${wallpaperKey}`, 'info');

      if (Platform.OS === 'web') {
        await wallpaperStore.cacheWallpaper(wallpaperKey, uri);
        addSyncLog(`✅ [CustomWallpaperService] Web platform - cached custom wallpaper: ${wallpaperKey}`, 'success');
        return { wallpaperKey, uri };
      }

      const localUri = `${WALLPAPER_DIR}${wallpaperKey}.jpg`;
      
      addSyncLog(`📁 [CustomWallpaperService] Copying custom wallpaper to: ${localUri}`, 'verbose');
      
      await FileSystem.copyAsync({
        from: uri,
        to: localUri
      });

      await wallpaperStore.cacheWallpaper(wallpaperKey, localUri);
      
      addSyncLog(`✅ [CustomWallpaperService] Successfully uploaded custom wallpaper: ${wallpaperKey}`, 'success');
      return { wallpaperKey, uri: localUri };

    } catch (error) {
      addSyncLog(`❌ [CustomWallpaperService] Failed to upload custom wallpaper`, 'error', error instanceof Error ? error.message : String(error));
      console.error('Failed to process custom wallpaper:', error);
      throw new Error('Failed to process custom wallpaper');
    }
  }

  async removeCustomWallpaper(wallpaperKey: `wallpaper-${string}`): Promise<void> {
    if (!wallpaperKey.startsWith(this.CUSTOM_WALLPAPER_PREFIX)) {
      addSyncLog(`❌ [CustomWallpaperService] Invalid custom wallpaper key: ${wallpaperKey}`, 'error');
      throw new Error('Invalid custom wallpaper key');
    }

    addSyncLog(`🗑️ [CustomWallpaperService] Removing custom wallpaper: ${wallpaperKey}`, 'info');

    const wallpaperStore = useWallpaperStore.getState();
    await wallpaperStore.clearUnusedWallpapers([wallpaperKey]);
    
    addSyncLog(`✅ [CustomWallpaperService] Successfully removed custom wallpaper: ${wallpaperKey}`, 'success');
  }

  isCustomWallpaper(wallpaperKey: string): wallpaperKey is `wallpaper-${string}` {
    return wallpaperKey.startsWith(this.CUSTOM_WALLPAPER_PREFIX);
  }
} 