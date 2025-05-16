import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { Image, ImageSourcePropType, ActivityIndicator, Platform } from 'react-native'
import { Stack } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useUserStore, useWallpaperStore } from '@/store'
import { useColorScheme } from '@/hooks/useColorScheme'
import * as Sentry from '@sentry/react-native'
import { isIpad } from '@/utils/deviceUtils'

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
  const gradientKey = useMemo(() => `gradient-${primaryColor}-${isDark}`, [primaryColor, isDark]);

  useEffect(() => {
    if (!hasHydrated) {
      setIsLoading(true); 
      return;
    }

    const loadWallpaper = async () => {
      setIsLoading(true); 
      setWallpaperSource(null);

      if (selectedStyle && selectedStyle.startsWith('wallpaper-')) {
        try {
          const cachedUri = await wallpaperStore.getCachedWallpaper(selectedStyle);
          if (cachedUri) {
            setWallpaperSource({ uri: cachedUri });
          } else {
            Sentry.addBreadcrumb({
              category: 'wallpaper',
              message: `Wallpaper ${selectedStyle} not found in cache. Falling back to gradient.`,
              level: 'warning',
            });
            console.warn(`[BackgroundSection] Wallpaper ${selectedStyle} not found in cache. Falling back to gradient.`);
            setPreferences({ ...preferences, backgroundStyle: 'gradient' });
          }
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              wallpaperStyle: selectedStyle,
              operation: 'loadWallpaper',
            },
          });
          console.error(`[BackgroundSection] Error loading cached wallpaper ${selectedStyle}:`, error);
          setPreferences({ ...preferences, backgroundStyle: 'gradient' });
        } finally {
          setIsLoading(false);
        }
      } else {
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
      return (
        <Stack flex={1} backgroundColor={isDark ? '#000' : '#fff'} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={primaryColor} />
        </Stack>
      );
    }

    switch (selectedStyle) {
      case 'gradient': {
        const baseColor = primaryColor;
        const accentColor = adjustColor(baseColor, isDark ? -40 : 60);
        const highlightColor = adjustColor(baseColor, isDark ? 80 : 120);
        const shadowColor = adjustColor(baseColor, isDark ? -120 : -80);
        const deepShadow = adjustColor(baseColor, isDark ? -180 : -140);
        
        return (
          <Stack key={gradientKey} position="absolute" width="100%" height="100%">
            <LinearGradient
              colors={[
                isDark ? shadowColor : highlightColor,
                isDark ? baseColor : accentColor,
                isDark ? deepShadow : shadowColor,
              ] as const}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              locations={[0, 0.5, 1]}
            />
            
            <LinearGradient
              colors={[
                isDark ? `${accentColor}40` : `${highlightColor}30`,
                'transparent',
                isDark ? `${shadowColor}40` : `${shadowColor}20`,
              ] as const}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              locations={[0, 0.5, 1]}
            />
            
            <LinearGradient
              colors={[
                isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
                isDark ? `${deepShadow}40` : `${highlightColor}20`,
                isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)',
              ] as const}
              start={{ x: 0.5, y: 0.2 }}
              end={{ x: 0.5, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              locations={[0, 0.7, 1]}
            />
            
            <LinearGradient
              colors={[
                isDark ? `${accentColor}30` : `${highlightColor}40`,
                'transparent'
              ] as const}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.3 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            
            {Platform.OS !== 'web' && (
              <BlurView
                intensity={isDark ? 20 : 15}
                tint={isDark ? "dark" : "dark"}
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)'
                }}
              />
            )}
            {Platform.OS === 'web' && (
              <BlurView
                intensity={25}
                tint={isDark ? "dark" : "light"}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            )}
          </Stack>
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
                  resizeMode: isIpad() ? 'stretch' : 'cover',
                }}
                onError={error => {
                  Sentry.captureException(error.nativeEvent, {
                    extra: {
                      wallpaperStyle: selectedStyle,
                      operation: 'Image_onError',
                    },
                  });
                  console.warn(`[BackgroundSection] Wallpaper load error for ${selectedStyle}:`, error.nativeEvent);
                  setPreferences({ ...preferences, backgroundStyle: 'gradient' });
                  setWallpaperSource(null); 
                }}
              />
              {Platform.OS !== 'web' && (
                <BlurView
                  intensity={isDark ? 50 : 40}
                  tint={isDark ? "dark" : "light"}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0, 0, 0, 0.1)'
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
  }, [isLoading, selectedStyle, primaryColor, adjustColor, isDark, wallpaperSource, preferences, setPreferences, gradientKey]);

  return background;
};
