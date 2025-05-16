import { getWallpapers, isImagePreloaded } from '@/services';
import { useWallpaperStore } from '@/store';
import { ImageSourcePropType } from 'react-native';
import { BackgroundStyleOption } from '@/types';

const s3Wallpapers = getWallpapers();

// Map to store wallpapers by their full name (including 'wallpaper-' prefix)
const wallpaperMap = new Map<string, { name: string; uri: string }>();

// Use the full name as the key, handling potential duplicates based on the full name
s3Wallpapers.forEach(({ name, uri }) => {
  // Only keep the first occurrence of each wallpaper based on its full name
  if (!wallpaperMap.has(name)) {
    wallpaperMap.set(name, { name, uri });
  }
});

// Create and export wallpapers object for getWallpaperPath using the full name as the key
export const wallpapers: Record<string, { uri: string; isLoaded?: boolean }> = {};
wallpaperMap.forEach(({ name, uri }) => {
  wallpapers[name] = { uri };
});

// Create friendly labels for wallpapers
const getFriendlyLabel = (name: string): string => {
  // Remove the 'wallpaper-' prefix before generating the friendly label
  const baseName = name.replace('wallpaper-', '');
  
  // Special case for Arc wallpapers
  if (baseName === 'wallpapers') return 'Arc Sky';
  if (baseName.startsWith('wallpapers-')) {
    const num = baseName.split('-')[1];
    switch (num) {
      case '1': return 'Arc Default';
      case '2': return 'Arc Bright';
      case '3': return 'Arc Purple';
      case '5': return 'Nemo Blue';
      default: return `Arc ${num}`;
    }
  }
  // For other wallpapers, capitalize each word
  return baseName.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const backgroundStyles: BackgroundStyleOption[] = [
  { label: 'Gradient', value: 'gradient' },
  // Use the full wallpaper name (including 'wallpaper-' prefix) as the value
  ...Array.from(wallpaperMap.keys()).map(wallpaperName => {
    return {
      label: getFriendlyLabel(wallpaperName),
      value: wallpaperName as BackgroundStyle
    };
  })
];

export type BackgroundStyle = BackgroundStyleOption['value'];

export const getWallpaperPath = async (style: BackgroundStyle): Promise<ImageSourcePropType | null> => {
  if (style.startsWith('wallpaper-')) {
    const wallpaperStore = useWallpaperStore.getState();
    const cachedUri = await wallpaperStore.getCachedWallpaper(style);
    return cachedUri ? { uri: cachedUri } : null;
  }
  return null;
};

export const isWallpaperLoaded = (style: BackgroundStyle): boolean => {
  if (!style.startsWith('wallpaper-')) return true;
  
  const wallpaper = wallpapers[style];
  if (!wallpaper) return false;
  
  return isImagePreloaded(wallpaper.uri);
};
