import React, { useCallback, useEffect, useState } from 'react'
import { Image, ImageSourcePropType } from 'react-native'
import { Stack } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useWallpaperStore } from '@/store/WallpaperStore'
import { getWallpaperPath } from '@/constants/Backgrounds'
import { useColorScheme } from '@/hooks/useColorScheme'

export const BackgroundSection = () => {
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const wallpaperStore = useWallpaperStore()
  const currentWallpaper = wallpaperStore.currentWallpaper
  const setCurrentWallpaper = wallpaperStore.setCurrentWallpaper
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [wallpaperSource, setWallpaperSource] = useState<ImageSourcePropType | null>(null)

  useEffect(() => {
    const loadWallpaper = async () => {
      if (currentWallpaper && currentWallpaper.startsWith('wallpaper-')) {
        try {
            const cachedUri = await wallpaperStore.getCachedWallpaper(currentWallpaper)
          if (cachedUri) {
            setWallpaperSource({ uri: cachedUri })
          } else {
            // Fall back to gradient if wallpaper not cached
            setCurrentWallpaper('gradient')
          }
        } catch (error) {
          console.warn('Failed to load cached wallpaper:', error)
          setCurrentWallpaper('gradient')
        }
      }
    }

    loadWallpaper()
  }, [currentWallpaper, wallpaperStore])

  const adjustColor = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  const background = React.useMemo(() => {
    switch (currentWallpaper) {
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
        if (currentWallpaper && currentWallpaper.startsWith('wallpaper-') && wallpaperSource) {
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
                onError={error => {
                  console.warn('Wallpaper load error:', error.nativeEvent)
                  if (currentWallpaper === 'wallpaper-1') {
                    setCurrentWallpaper('gradient')
                  }
                }}
              />
              <BlurView
                intensity={isDark ? 40 : 20}
                tint="dark"
                style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.3)' 
                }}
              />
            </Stack>
          )
        }
        return null
    }
  }, [currentWallpaper, primaryColor, adjustColor, isDark, wallpaperSource, setCurrentWallpaper])

  return background
}
