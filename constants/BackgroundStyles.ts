export const backgroundStyles = [
  { label: 'Primary-Gradient', value: 'gradient' },
  { label: 'Primary-Opaque', value: 'opaque' },
  { label: 'Arc Sky', value: 'wallpaper-0' },
  { label: 'Arc Default', value: 'wallpaper-1' },
  { label: 'Arc Bright', value: 'wallpaper-2' },
  { label: 'Arc Purple', value: 'wallpaper-3' },
  { label: 'Arc Green', value: 'wallpaper-4' },
  { label: 'Nemo Blue', value: 'wallpaper-5' },
//  { label: 'Custom', value: 'custom' },
] as const;

export type BackgroundStyle = typeof backgroundStyles[number]['value'];

export const getWallpaperPath = (style: BackgroundStyle) => {
  if (style.startsWith('wallpaper-')) {
    const number = style.split('-')[1];
    switch (number) {
      case '0':
        return require('../assets/wallpapers/wallpapers.png');
      case '1':
        return require('../assets/wallpapers/wallpapers-1.png');
      case '2':
        return require('../assets/wallpapers/wallpapers-2.png');
      case '3':
        return require('../assets/wallpapers/wallpapers-3.png');
      case '4':
        return require('../assets/wallpapers/wallpapers-4.png');
      case '5':
        return require('../assets/wallpapers/wallpapers-5.jpg');
      default:
        return null;
    }
  }
  return null;
};
