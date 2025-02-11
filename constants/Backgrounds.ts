import { Image } from 'react-native';

// Define wallpapers with static requires
const wallpapers = {
  'wallpaper-0': require('../assets/wallpapers-optimized/wallpapers.jpg'),
  'wallpaper-1': require('../assets/wallpapers-optimized/wallpapers-1.jpg'),
  'wallpaper-2': require('../assets/wallpapers-optimized/wallpapers-2.jpg'),
  'wallpaper-3': require('../assets/wallpapers-optimized/wallpapers-3.jpg'),
  'wallpaper-4': require('../assets/wallpapers-optimized/wallpapers-4.jpg'),
  'wallpaper-5': require('../assets/wallpapers-optimized/wallpapers-5.jpg'),
} as const;

export const backgroundStyles = [
  { label: 'Gradient', value: 'gradient' },
  { label: 'Opaque', value: 'opaque' },
  { label: 'Arc Sky', value: 'wallpaper-0' },
  { label: 'Arc Default', value: 'wallpaper-1' },
  { label: 'Arc Bright', value: 'wallpaper-2' },
  { label: 'Arc Purple', value: 'wallpaper-3' },
  { label: 'Arc Green', value: 'wallpaper-4' },
  { label: 'Nemo Blue', value: 'wallpaper-5' },
] as const;

export type BackgroundStyle = typeof backgroundStyles[number]['value'];

// Centralized wallpaper loading with type safety
export const getWallpaperPath = (style: BackgroundStyle) => {
  if (style.startsWith('wallpaper-')) {
    try {
      const source = wallpapers[style as keyof typeof wallpapers];
      if (!source) {
        console.error(`Wallpaper not found for style: ${style}`);
        return null;
      }
      //console.log(`Successfully loaded wallpaper for style: ${style}`, { source });
      return source;
    } catch (error) {
      // Enhanced error logging for debugging
      if (error instanceof Error) {
        console.error(`Error loading wallpaper ${style}:`, {
          error,
          errorName: error.name,
          errorMessage: error.message,
          stackTrace: error.stack
        });
      } else {
        console.error(`Unknown error loading wallpaper ${style}:`, error);
      }
      return null;
    }
  }
  return null;
};
