import { Platform } from "react-native";

const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

export interface S3Wallpaper {
  name: string;
  uri: string;
}

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
  
  return wallpapers.map(filename => ({
    name: filename.split('.')[0],
    uri: `${S3_URL}/wallpapers/${filename}`
  }));
};