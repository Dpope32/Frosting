import React from 'react'
import { View, Platform, useColorScheme, ImageSourcePropType, Image } from 'react-native'
import { Stack } from 'tamagui'

let LinearGradient: any = null;
let BlurView: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    LinearGradient = require('expo-linear-gradient').LinearGradient;
    BlurView = require('expo-blur').BlurView;
  } catch (error) {
    console.warn('Some native components could not be loaded:', error);
  }
}

interface BackgroundRendererProps {
  backgroundStyle: string;
  primaryColor: string;
  wallpaperSource: ImageSourcePropType | null;
  loadingWallpaper: boolean;
}

export default function BackgroundRenderer({ 
  backgroundStyle, 
  primaryColor, 
  wallpaperSource, 
  loadingWallpaper 
}: BackgroundRendererProps): React.JSX.Element | null {
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark'; 

  const adjustColor = React.useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  const background = React.useMemo(() => {
    switch (backgroundStyle) {
      case 'gradient': {
        const lighterColor = adjustColor(primaryColor, 100);
        const darkerColor = adjustColor(primaryColor, -250);
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          if (LinearGradient) {
            return (
              <LinearGradient
                colors={[lighterColor, primaryColor, darkerColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                locations={[0, 0.5, 1]}
              />
            );
          }
        }
        if (Platform.OS === 'web') {
          return (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: `linear-gradient(135deg, ${lighterColor} 0%, ${primaryColor} 50%, ${darkerColor} 100%)`,
              }}
            />
          );
        }
        return (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: primaryColor,
            }}
          >
            <View style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '50%', 
              backgroundColor: lighterColor,
              opacity: 0.7 
            }} />
            <View style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: '50%', 
              backgroundColor: darkerColor,
              opacity: 0.7 
            }} />
          </View>
        );
      }
      default:
        if (backgroundStyle.startsWith('wallpaper-')) {
          let sourceMatchesSelection = false;
          if (wallpaperSource && typeof wallpaperSource === 'object' && !Array.isArray(wallpaperSource) && typeof wallpaperSource.uri === 'string') {
            const parts = wallpaperSource.uri.split('/');
            const filenameWithPotentialQuery = parts[parts.length - 1];
            const filename = filenameWithPotentialQuery.split('?')[0];
            const wallpaperName = backgroundStyle.replace('wallpaper-', '');
            sourceMatchesSelection = filename.includes(wallpaperName);
          }

          if (loadingWallpaper || !wallpaperSource || !sourceMatchesSelection) {
            return null;
          }

          if ((Platform.OS === 'ios' || Platform.OS === 'android') && BlurView) {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  source={wallpaperSource}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
                <BlurView
                  intensity={isDark ? 60 : 30}
                  tint="dark"
                  style={{ position: 'absolute', width: '100%', height: '100%' }}
                />
              </Stack>
            );
          }
          if (Platform.OS === 'web') {
            return (
              <Stack position="absolute" width="100%" height="100%">
                <Image
                  source={wallpaperSource}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                />
              </Stack>
            );
          }
          return (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                source={wallpaperSource}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              />
            </Stack>
          );
        }
        return (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#121212',
            }}
          />
        );
    }
  }, [backgroundStyle, primaryColor, adjustColor, wallpaperSource, loadingWallpaper, isDark]);

  return background;
} 