import { Platform, Image } from "react-native";

const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

export interface S3Wallpaper {
  name: string;
  uri: string;
}

// Cache to store preloaded images - use the base URI (without cache busting) as the key
const imageCache: Record<string, boolean> = {};

// Extract base URI without cache busting parameters
const getBaseUri = (uri: string): string => {
  return uri.split('?')[0];
};

// Preload an image into memory cache
const preloadImage = (uri: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const baseUri = getBaseUri(uri);
    
    if (imageCache[baseUri]) {
      // Already preloaded
      console.log(`[Wallpaper] Using cached version of: ${baseUri.split('/').pop()}`);
      resolve();
      return;
    }

    if (Platform.OS === 'web') {
      // For web, use the browser's image loading
      const img = new window.Image();
      img.onload = () => {
        imageCache[baseUri] = true;
        resolve();
      };
      img.onerror = (error) => {
        console.error(`Failed to preload image: ${baseUri}`, error);
        reject(error);
      };
      img.src = uri;
    } else {
      // For native platforms, use React Native's Image.prefetch
      Image.prefetch(uri)
        .then(() => {
          imageCache[baseUri] = true;
          resolve();
        })
        .catch(error => {
          console.error(`Failed to preload image: ${baseUri}`, error);
          reject(error);
        });
    }
  });
};

// Static timestamp for the entire session to avoid multiple cache-busting parameters
const SESSION_TIMESTAMP = Date.now();

// s3Service.ts
export const getWallpapers = (): S3Wallpaper[] => {
  // Common wallpapers that work well on both platforms
  const commonWallpapers = [
    'Abstract.png',
    'Aesthetic.png',
    'clouds.png',
    'Dreams.png',
    'Fusion.png',
    'Spring.png',
    'jfk.jpg',
  ];
  
  // Platform-specific wallpapers
  const platformSpecific = Platform.OS === 'web' 
    ? ['fog.jpg', 'lannister.jpg', 'solitude.jpg', 'stanczyk.png'] // Web only
    : ['dark-statue.png', 'statue.png', 'girl.png', 'man.png']; // Mobile only
  
  const wallpapers = [...commonWallpapers, ...platformSpecific];
  
  // Use a single session timestamp for all wallpapers
  const wallpaperList = wallpapers.map(filename => {
    // Use a consistent URI with a single session timestamp
    const uri = `${S3_URL}/wallpapers/${filename}?_t=${SESSION_TIMESTAMP}`;
    
    return {
      name: filename.split('.')[0],
      uri
    };
  });
  
  return wallpaperList;
};

// Track if we've already done the initial preload
let initialPreloadComplete = false;

// Function to explicitly preload all wallpapers
export const preloadAllWallpapers = async (): Promise<void> => {
  // If we've already preloaded, don't do it again
  if (initialPreloadComplete) {
    console.log('[Wallpaper] Wallpapers already preloaded, skipping redundant preload');
    return;
  }
  
  const wallpapers = getWallpapers();
  
  console.log(`[Wallpaper] Starting preload of ${wallpapers.length} wallpapers...`);
  
  try {
    // Load 3 images at a time to avoid overwhelming the network
    const batchSize = 3;
    for (let i = 0; i < wallpapers.length; i += batchSize) {
      const batch = wallpapers.slice(i, i + batchSize);
      await Promise.all(batch.map(wallpaper => 
        preloadImage(wallpaper.uri)
          .then(() => console.log(`[Wallpaper] Preloaded: ${wallpaper.name}`))
          .catch(err => console.warn(`[Wallpaper] Failed to preload ${wallpaper.name}:`, err))
      ));
    }
    
    initialPreloadComplete = true;
    console.log('[Wallpaper] All wallpapers preloaded successfully');
  } catch (error) {
    console.error('[Wallpaper] Error during wallpaper preloading:', error);
  }
};

// Function to check if a specific wallpaper is preloaded
export const isWallpaperPreloaded = (uri: string): boolean => {
  const baseUri = getBaseUri(uri);
  return !!imageCache[baseUri];
};

// Function to preload a specific wallpaper by style
export const preloadWallpaperByStyle = async (style: string): Promise<void> => {
  if (!style.startsWith('wallpaper-')) {
    console.log(`[Wallpaper] Not a wallpaper style: ${style}`);
    return;
  }
  
  // Get all wallpapers
  const wallpapers = getWallpapers();
  
  // Find the matching wallpaper
  const baseName = style.substring('wallpaper-'.length);
  const wallpaper = wallpapers.find(w => w.name === baseName);
  
  if (!wallpaper) {
    console.warn(`[Wallpaper] Could not find wallpaper for style: ${style}`);
    return;
  }
  
  // Use the existing URI with the session timestamp
  const uri = wallpaper.uri;
  
  console.log(`[Wallpaper] Preloading specific wallpaper: ${style}`);
  
  try {
    // Check if already preloaded
    if (isWallpaperPreloaded(uri)) {
      console.log(`[Wallpaper] ${style} is already preloaded, using cached version`);
      return;
    }
    
    await preloadImage(uri);
    console.log(`[Wallpaper] Successfully preloaded: ${style}`);
  } catch (error) {
    console.error(`[Wallpaper] Failed to preload ${style}:`, error);
    throw error;
  }
};
