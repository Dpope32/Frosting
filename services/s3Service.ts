const S3_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;

export interface S3Wallpaper {
  name: string;
  uri: string;
}

export const getWallpapers = (): S3Wallpaper[] => [
  'clouds.png',
  'dark-statue.png',
  'girl.png',
  'man.png',
  'space.png',
  'statue.png',
  'wallpapers-1.jpg',
  'wallpapers-2.jpg',
  'wallpapers-3.jpg',
  'wallpapers-4.jpg',
  'wallpapers-5.jpg',
  'wallpapers.jpg'
].map(filename => ({
  name: filename.split('.')[0],
  uri: `${S3_URL}/wallpapers/${filename}`
}));
