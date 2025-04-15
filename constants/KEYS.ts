import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const THEME_STORAGE_KEY = '@frosting/color-scheme';
export const LAST_APP_VERSION_KEY = '@frosting/last-app-version';
export const PERMISSIONS_EXPLAINED_KEY = '@frosting/permissions_explained';
export const WALLPAPER_CACHE_DIR = Platform.OS !== 'web'  ? `${FileSystem.cacheDirectory || '' } wallpapers/`  : '';