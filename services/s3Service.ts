import { Platform } from "react-native";

const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

export interface S3Wallpaper { name: string; uri: string;}

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
      console.error(`Failed to preload image: ${uri}`, error);
      resolve(false);
    };
    img.src = uri;
  });
};

export const isImagePreloaded = (uri: string): boolean => {
  return !!preloadedImages[uri];
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
    ? ['fog.jpg', 'lannister.jpg', 'solitude.jpg', 'stanczyk.png', 'clouds.jpg'] // Web only
    : ['dark-statue.png', 'statue.png', 'girl.png', 'man.png']; // Mobile only
  
  const wallpapers = [...commonWallpapers, ...platformSpecific];
  
  return wallpapers.map(filename => {
    const uri = `${S3_URL}/wallpapers/${filename}`;
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
  const wallpapers = getWallpapers();
  if (Platform.OS === 'web') {
    await Promise.all(wallpapers.map(({ uri }) => preloadImage(uri)));
  }
};