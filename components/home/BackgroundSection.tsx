import React, { useCallback } from 'react'
import { Image, Platform } from 'react-native'
import { Stack } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { getWallpaperPath } from '@/constants/Backgrounds'
import { useColorScheme } from '@/hooks/useColorScheme'

export const BackgroundSection = () => {
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const backgroundStyle = useUserStore(s => s.preferences.backgroundStyle)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const adjustColor = useCallback((color: string, amount: number) => {
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
        const lighterColor = adjustColor(primaryColor, 100)
        const darkerColor = adjustColor(primaryColor, -250)
        return (
          <>
            <LinearGradient
              colors={[lighterColor, primaryColor, darkerColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
              locations={[0, 0.5, 1]}
            />
            <BlurView 
              intensity={isDark ? 40 : 30} 
              tint="dark" 
              style={{ position: 'absolute', width: '100%', height: '100%' }} 
            />
          </>
        )
      }
      default:
        if (backgroundStyle.startsWith('wallpaper-')) {
          const wallpaper = getWallpaperPath(backgroundStyle)
          return wallpaper ? (
            <Stack position="absolute" width="100%" height="100%">
              <Image
                source={wallpaper}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                }}
                onError={error => {
                  console.warn('Wallpaper load error:', error.nativeEvent)
                  if (backgroundStyle === 'wallpaper-1') {
                    useUserStore.getState().setPreferences({ backgroundStyle: 'gradient' })
                  }
                }}
                loadingIndicatorSource={wallpaper}
              />
              <BlurView
                intensity={isDark ? 70 : 35}
                tint="dark"
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.3)' 
                }}
              />
            </Stack>
          ) : null
        }
        return null
    }
  }, [backgroundStyle, primaryColor, adjustColor, isDark])

  return background
}