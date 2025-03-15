import { Platform } from "react-native";

const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

export interface S3Wallpaper {
  name: string;
  uri: string;
}

// Cache for preloaded images
const preloadedImages: Record<string, HTMLImageElement | boolean> = {};

// Function to preload image on web
export const preloadImage = (uri: string): Promise<boolean> => {
  if (Platform.OS !== 'web') {
    return Promise.resolve(true); // Native platforms handle this differently
  }
  
  if (preloadedImages[uri] === true) {
    return Promise.resolve(true); // Already loaded
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedImages[uri] = img;
      console.log(`Successfully preloaded: ${uri}`);
      resolve(true);
    };
    img.onerror = (error) => {
      console.error(`Failed to preload image: ${uri}`, error);
      resolve(false);
    };
    img.src = uri;
  });
};

// Function to check if image is preloaded
export const isImagePreloaded = (uri: string): boolean => {
  return !!preloadedImages[uri];
};

export const getWallpapers = (): S3Wallpaper[] => {
  // Common wallpapers that work well on both platforms
  const commonWallpapers = [
    'Abstract.jpg',
    'Aesthetic.jpg',
    'clouds.jpg',
    'Dreams.jpg',
    'Fusion.jpg',
    'Spring.jpg',
    'jfk.jpg', // already jpg, you're good here
  ];
  
  // Platform-specific wallpapers
  const platformSpecific = Platform.OS === 'web' 
    ? ['fog.jpg', 'lannister.jpg', 'solitude.jpg', 'stanczyk.png'] // Web only
    : ['dark-statue.png', 'statue.png', 'girl.png', 'man.png']; // Mobile only
  
  const wallpapers = [...commonWallpapers, ...platformSpecific];
  
  return wallpapers.map(filename => {
    const uri = `${S3_URL}/wallpapers/${filename}`;
    // Prefetch image URLs on web
    if (Platform.OS === 'web') {
      preloadImage(uri).catch(console.error);
    }
    return {
      name: filename.split('.')[0],
      uri
    };
  });
};

// Function to preload all wallpapers
export const preloadAllWallpapers = async (): Promise<void> => {
  const wallpapers = getWallpapers();
  if (Platform.OS === 'web') {
    console.log('Preloading all wallpapers...');
    await Promise.all(wallpapers.map(({ uri }) => preloadImage(uri)));
    console.log('All wallpapers preloaded');
  }
};