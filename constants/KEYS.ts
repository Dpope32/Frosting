import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export const THEME_STORAGE_KEY = '@frosting/color-scheme';
export const LAST_APP_VERSION_KEY = '@frosting/last-app-version';
export const PERMISSIONS_EXPLAINED_KEY = '@frosting/permissions_explained';
// Fixed: Changed from cacheDirectory (volatile) to documentDirectory (persistent)
export const WALLPAPER_DIR = Platform.OS !== 'web'  ? `${FileSystem.documentDirectory || '' }wallpapers/`  : '';
export const AUTHORIZED_USERS = ["DeeDaw", "Bono", "Ksizzle13", "Father"];