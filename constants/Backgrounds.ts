import { getWallpapers, type S3Wallpaper } from '../services/s3Service';

// Function to create a friendly label from filename
// Map of custom labels for specific wallpapers
const wallpaperLabels: Record<string, string> = {
  'wallpapers': 'Arc Sky',
  'wallpapers-1': 'Arc Default',
  'wallpapers-2': 'Arc Bright',
  'wallpapers-3': 'Arc Purple',
  'wallpapers-5': 'Nemo Blue',
  'clouds': 'Cloudy Sky',
  'dark-statue': 'Dark Statue',
  'space': 'Space',
  'statue': 'Statue',
  'girl': 'Silhouette',
  'man': 'Shadow'
};

export type BackgroundStyleOption = {
  label: string;
  value: 'gradient' | `wallpaper-${number}`;
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
