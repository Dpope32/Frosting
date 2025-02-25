import { getWallpapers, type S3Wallpaper } from '../services/s3Service';

// Backgrounds.ts
const wallpaperLabels: Record<string, string> = {
  // Common wallpapers
  'Abstract': 'Abstract',
  'Aesthetic': 'Aesthetic',
  'clouds': 'Cloudy Sky',
  'Dreams': 'Dreams',
  'Fusion': 'Fusion',
  'space': 'Space',
  'Spring': 'Spring',
  
  // Mobile-specific
  'dark-statue': 'Dark Statue',
  'statue': 'Statue',
  'girl': 'Silhouette',
  'man': 'Shadow',
  
  // Web-specific
  'fog': 'Foggy Forest',
  'jfk': 'JFK',
  'lannister': 'Lannister',
  'solitude': 'Solitude',
  'stanczyk': 'Stanczyk'
};

export type BackgroundStyleOption = {
  label: string;
  value: 'gradient' | `wallpaper-${number}` | 'space' | 'silhouette';
};

const s3Wallpapers = getWallpapers();

const wallpapers: Record<string, { uri: string }> = s3Wallpapers.reduce((acc: Record<string, { uri: string }>, { name, uri }: S3Wallpaper, index: number) => {
  const key = `wallpaper-${index}`;
  acc[key] = { uri };
  return acc;
}, {});

export const backgroundStyles: BackgroundStyleOption[] = [
  { label: 'Gradient', value: 'gradient' },
  ...s3Wallpapers.map((wallpaper: S3Wallpaper, index: number) => ({
    label: wallpaperLabels[wallpaper.name] || wallpaper.name,
    value: `wallpaper-${index}` as const
  }))
];

export type BackgroundStyle = BackgroundStyleOption['value'];

export const getWallpaperPath = (style: BackgroundStyle) => {
  if (style.startsWith('wallpaper-')) {
    return wallpapers[style] || null;
  }
  return null;
};
