import { Platform } from "react-native";
import { LogBox } from 'react-native';

const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

export interface S3Wallpaper { name: string; uri: string;}

const preloadedImages: Record<string, HTMLImageElement | boolean> = {};

export const preloadImage = (uri: string): Promise<boolean> => {
  console.log(`[S3Service] Preloading image: ${uri}`);
  if (Platform.OS !== 'web') {
    return Promise.resolve(true); 
  }
  
  if (preloadedImages[uri] === true) {
    console.log(`[S3Service] Image already preloaded: ${uri}`);
    return Promise.resolve(true); 
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log(`[S3Service] Successfully preloaded image: ${uri}`);
      preloadedImages[uri] = img;
      resolve(true);
    };
    img.onerror = (error) => {
      console.error(`[S3Service] Failed to preload image: ${uri}`, error);
      resolve(false);
    };
    img.src = uri;
  });
};

export const isImagePreloaded = (uri: string): boolean => {
  const preloaded = !!preloadedImages[uri];
  console.log(`[S3Service] Checking if image preloaded (${uri}): ${preloaded}`);
  return preloaded;
};

export const getWallpapers = (): S3Wallpaper[] => {
  console.log('[S3Service] Getting wallpaper list');
  const commonWallpapers = [
    'Abstract.jpg',
    'Aesthetic.jpg',
    'Dreams.jpg',
    'Fusion.jpg',
    'Spring.jpg',
    'jfk.jpg', 
  ];
  
  const platformSpecific = Platform.OS === 'web' 
    ? ['fog.jpg', 'lannister.jpg', 'solitude.jpg', 'stanczyk.png', 'clouds.png'] // Web only
    : ['dark-statue.png', 'statue.png', 'girl.png', 'man.png']; // Mobile only
  
  const wallpapers = [...commonWallpapers, ...platformSpecific];
  
  return wallpapers.map(filename => {
    const uri = `${S3_URL}/wallpapers/${filename}`;
    console.log(`[S3Service] Preparing wallpaper: ${filename} (${uri})`);
    if (Platform.OS === 'web') {
      preloadImage(uri).catch(console.error);
    }
    return {
      name: filename.split('.')[0],
      uri
    };
  });
};

export const preloadAllWallpapers = async (): Promise<void> => {
  console.log('[S3Service] Starting preload of all wallpapers');
  const wallpapers = getWallpapers();
  if (Platform.OS === 'web') {
    await Promise.all(wallpapers.map(({ uri }) => preloadImage(uri)));
  }
  console.log('[S3Service] Completed preload of all wallpapers');
};

// Ignore specific warnings
LogBox.ignoreLogs([
  'Possible Unhandled Promise Rejection',
]);
