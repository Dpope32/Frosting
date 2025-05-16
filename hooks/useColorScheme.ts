import { useColorScheme as useRNColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME_STORAGE_KEY } from '@/constants';

export function useColorScheme() {
  // Initialize with null to indicate loading state
  const [storedTheme, setStoredTheme] = useState<string | null>(null);
  const systemColorScheme = useRNColorScheme();
  
  // Load the stored theme on initial render
  useEffect(() => {
    const loadStoredTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        setStoredTheme(savedTheme);
      } catch (error) {
        console.error('Error loading stored theme:', error);
      }
    };
    
    loadStoredTheme();
  }, []);
  
  // Save the system theme when it changes
  useEffect(() => {
    const saveTheme = async () => {
      if (systemColorScheme) {
        try {
          await AsyncStorage.setItem(THEME_STORAGE_KEY, systemColorScheme);
          setStoredTheme(systemColorScheme);
        } catch (error) {
          console.error('Error saving theme:', error);
        }
      }
    };
    
    if (systemColorScheme && systemColorScheme !== storedTheme) {
      saveTheme();
    }
  }, [systemColorScheme, storedTheme]);
  
  // Return stored theme if available, otherwise system theme, with fallback to 'dark'
  return storedTheme || systemColorScheme || 'dark';
}
