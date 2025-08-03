import { Platform } from "react-native";
import Constants from 'expo-constants';

//const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

// Use Constants.expoConfig with fallback to environment variable
const S3_URL = Constants.expoConfig?.extra?.s3BucketUrl || process.env?.EXPO_PUBLIC_S3_BUCKET_URL 

export interface S3Wallpaper { 
  name: string; 
  uri: string;
}

const preloadedImages: Record<string, HTMLImageElement | boolean> = {};

export const preloadImage = (uri: string): Promise<boolean> => {
  
  if (Platform.OS !== 'web') {
    return Promise.resolve(true); 
  }
  
  if (preloadedImages[uri] === true) {
    return Promise.resolve(true); 
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
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
  return preloaded;
};

export const getWallpapers = (): S3Wallpaper[] => {
  
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
    const name = filename.split('.')[0];
    const wallpaperKey = `wallpaper-${name}`;
    
    
    if (Platform.OS === 'web') {
      preloadImage(uri).catch(err => 
        console.error(`[S3Service] Error preloading ${uri}:`, err)
      );
    }
    
    return {
      name: wallpaperKey,
      uri
    };
  });
};

export const preloadAllWallpapers = async (): Promise<void> => {
  const wallpapers = getWallpapers();
  
  if (Platform.OS === 'web') {
    try {
      await Promise.all(wallpapers.map(({ uri }) => preloadImage(uri)));
    } catch (error) {
      console.error('[S3Service] Error during preload of all wallpapers:', error);
    }
  } else {
  }
};
