import { useState } from 'react';
import { CustomWallpaperService } from '@/services';
import { useImagePicker } from './useImagePicker';
import { useToastStore, useWallpaperStore } from '@/store';

export function useCustomWallpaper() {
  const [isUploading, setIsUploading] = useState(false);
  const { pickImage } = useImagePicker({
    allowsEditing: true,
    quality: 1,
  });
  const { showToast } = useToastStore();
  const wallpaperStore = useWallpaperStore();
  const customWallpaperService = new CustomWallpaperService();

  const uploadCustomWallpaper = async (): Promise<`wallpaper-${string}` | null> => {
    setIsUploading(true);
    try {
      const imageUri = await pickImage();
      if (!imageUri) return null;

      const { wallpaperKey } = await customWallpaperService.uploadCustomWallpaper(imageUri);
      if (wallpaperKey) {
        wallpaperStore.setCurrentWallpaper(wallpaperKey);
        showToast('Wallpaper updated successfully', 'success');
      }
      return wallpaperKey;
    } catch (error) {
      console.error('Failed to upload custom wallpaper:', error);
      showToast('Failed to upload custom wallpaper', 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadCustomWallpaper,
    isUploading,
    isCustomWallpaper: customWallpaperService.isCustomWallpaper.bind(customWallpaperService)
  };
} 