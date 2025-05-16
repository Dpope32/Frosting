import { THEME_STORAGE_KEY } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName } from 'react-native';

export async function preloadTheme(systemColorScheme: ColorSchemeName) {
    try {
      if (systemColorScheme) {
        // Check if we already have the users device theme1
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        // If no stored theme OR it's different from system theme, update it
        if (!storedTheme || storedTheme !== systemColorScheme) {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, systemColorScheme);
        }
      }
    } catch (error) {
      console.error('Error preloading theme:', error);
    }
  }