import React, { useCallback, useEffect, useState } from 'react'
import { Image, ImageSourcePropType, ActivityIndicator, Platform } from 'react-native'
import { Stack } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useWallpaperStore } from '@/store/WallpaperStore'
import { useColorScheme } from '@/hooks/useColorScheme'
import { getWallpaperPath } from '@/constants/Backgrounds'

export const BackgroundSection = () => {
  const preferences = useUserStore(s => s.preferences);
  const setPreferences = useUserStore(s => s.setPreferences);
  const hasHydrated = useUserStore(s => (s as any).hydrated ?? false);
  const primaryColor = preferences.primaryColor;
  const selectedStyle = preferences.backgroundStyle;
  const wallpaperStore = useWallpaperStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [wallpaperSource, setWallpaperSource] = useState<{uri: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (!hasHydrated) {
      setIsLoading(true);
      return;
    }

    const loadWallpaper = async () => {
      setIsLoading(true);
      setWallpaperSource(null);

      if (selectedStyle && selectedStyle.startsWith('wallpaper-')) {
        let retryCount = 0;
        const MAX_RETRIES = 3;
        let success = false;

        while (retryCount < MAX_RETRIES && !success) {
          try {
            const cachedUri = await wallpaperStore.getCachedWallpaper(selectedStyle);
            if (cachedUri) {
              // Verify the URI is actually accessible
              const response = await fetch(cachedUri, { method: 'HEAD' });
              if (response.ok) {
                setWallpaperSource({ uri: cachedUri });
                success = true;
              } else {
                throw new Error('Wallpaper exists but is not accessible');
              }
            } else {
              // If not cached, try to cache it
              const wallpaperPath = await getWallpaperPath(selectedStyle);
              if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
                await wallpaperStore.cacheWallpaper(selectedStyle, wallpaperPath.uri as string);
                // Verify it was cached successfully
                const verifiedUri = await wallpaperStore.getCachedWallpaper(selectedStyle);
                if (verifiedUri) {
                  setWallpaperSource({ uri: verifiedUri });
                  success = true;
                }
              }
            }
          } catch (error) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) {
              console.error(`[BackgroundSection] Failed to load wallpaper ${selectedStyle} after ${MAX_RETRIES} attempts:`, error);
              setPreferences({ ...preferences, backgroundStyle: 'gradient' });
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
      } else {
        setWallpaperSource(null);
      }
      setIsLoading(false);
    };

    loadWallpaper();

    // Add periodic refresh to ensure wallpaper stays loaded
    const refreshInterval = setInterval(() => {
      if (selectedStyle && selectedStyle.startsWith('wallpaper-') && wallpaperSource) {
        // Verify the wallpaper is still accessible
        fetch(wallpaperSource.uri, { method: 'HEAD' }).catch(() => {
          console.warn('[BackgroundSection] Wallpaper verification failed, reloading...');
          loadWallpaper();
        });
      }
    }, 3600000); // Check every hour

    return () => clearInterval(refreshInterval);
  }, [selectedStyle, wallpaperStore, hasHydrated, setPreferences, preferences, wallpaperSource]);

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
       return (
         <Stack flex={1} backgroundColor={isDark ? '#000' : '#fff'} alignItems="center" justifyContent="center">
           <ActivityIndicator size="large" color={primaryColor} />
         </Stack>
       );
    }

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
        return null;
    }
  }, [isLoading, selectedStyle, primaryColor, adjustColor, isDark, wallpaperSource, preferences, setPreferences]);

  return background;
};
