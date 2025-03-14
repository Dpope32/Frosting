import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const THEME_STORAGE_KEY = '@frosting/color-scheme';

/**
 * Enhanced version of useColorScheme for web that:
 * 1. Supports static rendering by re-calculating on the client side
 * 2. Stores the theme preference in localStorage to prevent theme bounce
 * 3. Provides a consistent experience across page loads
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [storedTheme, setStoredTheme] = useState<string | null>(null);
  const systemColorScheme = useRNColorScheme();

  // Load stored theme and mark as hydrated on mount
  useEffect(() => {
    try {
      // For web, we use localStorage instead of AsyncStorage
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      setStoredTheme(savedTheme);
    } catch (error) {
      console.error('Error loading stored theme:', error);
    }
    
    setHasHydrated(true);
  }, []);
  
  // Save the system theme when it changes
  useEffect(() => {
    if (hasHydrated && systemColorScheme && systemColorScheme !== storedTheme) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, systemColorScheme);
        setStoredTheme(systemColorScheme);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  }, [hasHydrated, systemColorScheme, storedTheme]);

  // If hydrated, use stored theme or system theme
  if (hasHydrated) {
    return storedTheme || systemColorScheme || 'dark';
  }
  
  // Before hydration, use stored theme from localStorage if available
  // This is a synchronous check that can be done even before hydration
  try {
    const initialTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (initialTheme) {
      return initialTheme;
    }
  } catch (e) {
    // Ignore errors with localStorage
  }
  
  // Default fallback
  return 'dark';
}
