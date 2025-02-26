import { getWallpapers, type S3Wallpaper } from '../services/s3Service';


export type BackgroundStyleOption = {
  label: string;
  value: 'gradient' | `wallpaper-${string}` | 'space' | 'silhouette';
};

const s3Wallpapers = getWallpapers();

// Map to store wallpapers by their base name (without extension)
const wallpaperMap = new Map<string, { name: string; uri: string }>();

// Group wallpapers by their base name to handle duplicates
s3Wallpapers.forEach(({ name, uri }) => {
  const baseName = name.split('.')[0];
  // Only keep the first occurrence of each wallpaper
  if (!wallpaperMap.has(baseName)) {
    wallpaperMap.set(baseName, { name, uri });
  }
});

// Create wallpapers object for getWallpaperPath
const wallpapers: Record<string, { uri: string }> = {};
wallpaperMap.forEach(({ name, uri }, baseName) => {
  wallpapers[`wallpaper-${baseName}`] = { uri };
});

// Create friendly labels for wallpapers
const getFriendlyLabel = (name: string): string => {
  // Special case for Arc wallpapers
  if (name === 'wallpapers') return 'Arc Sky';
  if (name.startsWith('wallpapers-')) {
    const num = name.split('-')[1];
    switch (num) {
      case '1': return 'Arc Default';
      case '2': return 'Arc Bright';
      case '3': return 'Arc Purple';
      case '5': return 'Nemo Blue';
      default: return `Arc ${num}`;
    }
  }
  // For other wallpapers, capitalize each word
  return name.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Create background styles from deduplicated wallpapers
export const backgroundStyles: BackgroundStyleOption[] = [
  { label: 'Gradient', value: 'gradient' },
  { label: 'Space', value: 'space' },
  { label: 'Silhouette', value: 'silhouette' },
  ...Array.from(wallpaperMap.keys()).map(baseName => ({
    label: getFriendlyLabel(baseName),
    value: `wallpaper-${baseName}` as const
  }))
];

export type BackgroundStyle = BackgroundStyleOption['value'];

export const getWallpaperPath = (style: BackgroundStyle) => {
  if (style.startsWith('wallpaper-')) {
    return wallpapers[style] || null;
  }
  // For space and silhouette, we'll return null as they might be handled differently
  // in the UI (e.g., with a custom background component)
  if (style === 'space' || style === 'silhouette') {
    return null;
  }
  return null;
};
