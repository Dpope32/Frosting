import { ImageSourcePropType, Platform } from 'react-native';
import { BackgroundStyle, getWallpaperPath } from '@/constants/Backgrounds';
import { useWallpaperStore } from '@/store';
import { ImageURISource } from 'react-native';

export interface WallpaperSource extends ImageURISource {
  failed?: boolean;
}

export interface Settings {
  username: string;
  primaryColor: string;
  profilePicture: string | undefined;
  zipCode: string;
  backgroundStyle: "gradient" | `wallpaper-${string}`;
  notificationsEnabled: boolean;
  quoteEnabled: boolean;
  portfolioEnabled: boolean;
  temperatureEnabled: boolean;
  wifiEnabled: boolean;
}

/**
 * Creates an image source from a URI
 */
export const buildImageSource = (uri?: string): ImageSourcePropType | undefined => {
  if (!uri) return undefined;
  return { uri };
};

/**
 * Handles image picker functionality based on platform
 */
export const pickImage = async (
  isWeb: boolean, 
  ImagePicker: any, 
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
) => {
  if (isWeb) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const target = event.target as FileReader;
          if (target?.result) {
            setSettings((prev) => ({ ...prev, profilePicture: String(target.result) }));
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  } else if (ImagePicker) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setSettings((prev) => ({ ...prev, profilePicture: result.assets[0].uri }));
    }
  }
};

/**
 * Handles wallpaper selection and caching
 */
export const handleSelectBackground = async (
  value: BackgroundStyle, 
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
) => {
  if (value.startsWith('wallpaper-')) {
    const wallpaperStore = useWallpaperStore.getState();
    try {
      const cachedUri = await wallpaperStore.getCachedWallpaper(value);
      if (!cachedUri) {
        const wallpaperPath = await getWallpaperPath(value);
        if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
          await wallpaperStore.cacheWallpaper(value, wallpaperPath.uri);
        }
      }
      wallpaperStore.setCurrentWallpaper(value);
    } catch (error) {
      console.error(`Failed to cache wallpaper ${value}:`, error);
    }
  }
  
  setSettings((prev) => ({ ...prev, backgroundStyle: value }));
};

/**
 * Gets the image source for a wallpaper style
 */
export const getWallpaperImageSource = (
  style: BackgroundStyle, 
  wallpaperSources: Record<string, WallpaperSource>
): WallpaperSource | undefined => {
  if (style === 'gradient') {
    return { uri: '' };
  }
  return wallpaperSources[style];
};

/**
 * Initialize ImagePicker based on platform
 */
export const initImagePicker = (): any => {
  let ImagePicker: any = null;
  if (Platform.OS !== 'web') {
    try {
      const imagePickerModule = 'expo-image-picker';
      ImagePicker = require(imagePickerModule);
    } catch (error) {
      console.warn('ImagePicker not available:', error);
    }
  }
  return ImagePicker;
};
