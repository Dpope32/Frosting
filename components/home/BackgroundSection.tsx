import React, { useCallback, useEffect, useState } from 'react'
import { Image, ImageSourcePropType, ActivityIndicator, Platform } from 'react-native'
import { Stack } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useWallpaperStore } from '@/store/WallpaperStore'
import { useColorScheme } from '@/hooks/useColorScheme'

export const BackgroundSection = () => {
  const preferences = useUserStore(s => s.preferences);
  const setPreferences = useUserStore(s => s.setPreferences);
  const hasHydrated = useUserStore(s => (s as any).hydrated ?? false);
  const primaryColor = preferences.primaryColor;
  const selectedStyle = preferences.backgroundStyle;
  const wallpaperStore = useWallpaperStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [wallpaperSource, setWallpaperSource] = useState<ImageSourcePropType | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    // Wait for store hydration
    if (!hasHydrated) {
      console.log('[BackgroundSection] Waiting for hydration...');
      setIsLoading(true); 
      return;
    }
     console.log(`[BackgroundSection] Hydrated. Selected style: ${selectedStyle}`);

    const loadWallpaper = async () => {
      setIsLoading(true); 
      setWallpaperSource(null);

      if (selectedStyle && selectedStyle.startsWith('wallpaper-')) {
        try {
          console.log(`[BackgroundSection] Attempting to load cached wallpaper: ${selectedStyle}`);
          const cachedUri = await wallpaperStore.getCachedWallpaper(selectedStyle);
          if (cachedUri) {
            console.log(`[BackgroundSection] Found cached URI: ${cachedUri}`);
            setWallpaperSource({ uri: cachedUri });
          } else {
            console.warn(`[BackgroundSection] Wallpaper ${selectedStyle} not found in cache. Falling back to gradient.`);
            setPreferences({ ...preferences, backgroundStyle: 'gradient' });
          }
        } catch (error) {
          console.error(`[BackgroundSection] Error loading cached wallpaper ${selectedStyle}:`, error);
          setPreferences({ ...preferences, backgroundStyle: 'gradient' });
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('[BackgroundSection] Style is gradient or invalid, clearing wallpaper source.');
        setWallpaperSource(null); 
        setIsLoading(false);
      }
    };

    loadWallpaper();
  }, [selectedStyle, wallpaperStore, hasHydrated, setPreferences, preferences]);

  const adjustColor = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, []);

  const background = React.useMemo(() => {
    if (isLoading) {
       console.log('[BackgroundSection] Rendering loading indicator.');
       return (
         <Stack flex={1} backgroundColor={isDark ? '#000' : '#fff'} alignItems="center" justifyContent="center">
           <ActivityIndicator size="large" color={primaryColor} />
         </Stack>
       );
    }

     console.log(`[BackgroundSection] Rendering background for style: ${selectedStyle}`);
    switch (selectedStyle) {
      case 'gradient': {
        const lighterColor = adjustColor(primaryColor, 100);
        const darkerColor = adjustColor(primaryColor, -250);
        return (
          <>
            <LinearGradient
              colors={[lighterColor, primaryColor, darkerColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              locations={[0, 0.5, 1]}
            />
            {Platform.OS !== 'web' && (
              <BlurView
                intensity={isDark ? 40 : 40}
                tint={"dark"}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            )}
             {Platform.OS === 'web' && (
               <BlurView
                 intensity={40}
                 tint={isDark ? "dark" : "light"}
                 style={{ position: 'absolute', width: '100%', height: '100%' }}
               />
             )}
          </>
        );
      }
      default:
        if (selectedStyle && selectedStyle.startsWith('wallpaper-') && wallpaperSource) {
           console.log(`[BackgroundSection] Rendering wallpaper image: ${selectedStyle}`);
          return (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                key={selectedStyle}
                source={wallpaperSource}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
                onError={error => {
                  console.warn(`[BackgroundSection] Wallpaper load error for ${selectedStyle}:`, error.nativeEvent);
                  setPreferences({ ...preferences, backgroundStyle: 'gradient' });
                  setWallpaperSource(null); 
                }}
              />
              {Platform.OS !== 'web' && (
                <BlurView
                  intensity={isDark ? 40 : 20}
                  tint="dark"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)'
                  }}
                />
              )}
               {Platform.OS === 'web' && (
                 <BlurView
                   intensity={40}
                   tint={isDark ? "dark" : "light"}
                   style={{ position: 'absolute', width: '100%', height: '100%' }}
                 />
               )}
            </Stack>
          );
        }
         console.log(`[BackgroundSection] No valid condition met for style ${selectedStyle}, returning null.`);
        return null;
    }
  }, [isLoading, selectedStyle, primaryColor, adjustColor, isDark, wallpaperSource, preferences, setPreferences]);

  return background;
};
