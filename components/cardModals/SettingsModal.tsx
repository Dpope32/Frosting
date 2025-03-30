import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Image, ImageSourcePropType, Platform, Switch, useColorScheme } from 'react-native'
import { Sheet, Button, YStack, XStack, Text, Circle } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { useWallpaperStore } from '@/store/WallpaperStore'
import { colorOptions } from '../../constants/Colors'
import { backgroundStyles, BackgroundStyle, getWallpaperPath } from '../../constants/Backgrounds'
import { ColorPickerModal } from '../cardModals/ColorPickerModal'
import { DebouncedInput } from '../shared/debouncedInput'

let ImagePicker: any = null
if (Platform.OS !== 'web') {
  try {
    const imagePickerModule = 'expo-image-picker'
    ImagePicker = require(imagePickerModule)
  } catch (error) {
    console.warn('ImagePicker not available:', error)
  }
}
interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}


const OptimizedWallpaperButton = React.memo(function OptimizedWallpaperButton({
  styleItem,
  isSelected,
  isDark,
  primaryColor,
  isWeb,
  onSelect,
  getWallpaperImageSource,
  index,
  totalInRow,
}: {
  styleItem: { value: BackgroundStyle; label: string }
  isSelected: boolean
  isDark: boolean
  primaryColor: string
  isWeb: boolean
  onSelect: (value: BackgroundStyle) => void
  getWallpaperImageSource: (style: BackgroundStyle) => ImageSourcePropType | undefined
  index: number
  totalInRow: number
}) {
  const borderColor = isSelected ? 'white' : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  const isLastInRow = index === totalInRow - 1
  return (
    <YStack flex={1} height="100%" marginRight={isLastInRow ? 0 : 8} minWidth={isWeb ? 100 : undefined}>
      <Button
        size="$3"
        height="100%"
        width="100%"
        padding={0}
        backgroundColor={isSelected ? primaryColor : isDark ? '#333' : '#f5f5f5'}
        borderColor={borderColor}
        borderWidth={isSelected ? 2 : 1}
        scale={isSelected ? 1.05 : 1}
        onPress={() => onSelect(styleItem.value)}
      >
        {styleItem.value === 'gradient' ? (
          <YStack
            width="100%"
            height="100%"
            br={4}
            {...(isWeb
              ? {
                  style: {
                    background: 'linear-gradient(120deg, #3a7bd5, #00d2ff, #3a7bd5)',
                    backgroundSize: '200% 200%',
                    animation: 'gradientAnimation 5s ease infinite',
                    position: 'relative',
                  },
                }
              : { backgroundColor: '#3a7bd5' })}
          >
            {isWeb && (
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes gradientAnimation {
                    0% { background-position: 0% 50% }
                    50% { background-position: 100% 50% }
                    100% { background-position: 0% 50% }
                  }
                `,
                }}
              />
            )}
          </YStack>
        ) : (
          <YStack width="100%" height="100%" overflow="hidden" br={4}>
            <Image
              source={getWallpaperImageSource(styleItem.value)}
              style={{ width: '100%', height: '100%', borderRadius: 4 }}
              resizeMode="cover"
              {...(isWeb ? { loading: 'lazy' } : {})}
            />
          </YStack>
        )}
      </Button>
    </YStack>
  )
})
export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { preferences, setPreferences } = useUserStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const [wallpapersToShow, setWallpapersToShow] = useState(isWeb ? 3 : 8)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [settings, setSettings] = useState({
    username: preferences.username,
    primaryColor: preferences.primaryColor,
    profilePicture: preferences.profilePicture || undefined,
    zipCode: preferences.zipCode,
    backgroundStyle: preferences.backgroundStyle || 'gradient',
    notificationsEnabled: preferences.notificationsEnabled,
    quoteEnabled: preferences.quoteEnabled ?? true,
    portfolioEnabled: preferences.portfolioEnabled ?? true,
    temperatureEnabled: preferences.temperatureEnabled ?? true,
    wifiEnabled: preferences.wifiEnabled ?? true,
  })
  const sheetFrameStyle = useMemo(
    () => (isWeb ? { overflowY: 'auto', maxHeight: '90vh', maxWidth: 600, margin: '0 auto', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' } : {}),
    [isWeb]
  )
  const filteredBackgroundStyles = useMemo(() => {
    if (!isWeb || wallpapersToShow >= backgroundStyles.length) return backgroundStyles
    return backgroundStyles.slice(0, wallpapersToShow)
  }, [isWeb, wallpapersToShow])
  const buildImageSource = useCallback((uri?: string): ImageSourcePropType | undefined => {
    if (!uri) return undefined
    return { uri }
  }, [])
  const pickImage = useCallback(async () => {
    if (isWeb) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event: ProgressEvent<FileReader>) => {
            const target = event.target as FileReader
            if (target?.result) {
              setSettings((prev) => ({ ...prev, profilePicture: String(target.result) }))
            }
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    } else if (ImagePicker) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      })
      if (!result.canceled) {
        setSettings((prev) => ({ ...prev, profilePicture: result.assets[0].uri }))
      }
    }
  }, [isWeb])
  const handleSave = useCallback(() => {
    setPreferences({ ...settings })
    onOpenChange(false)
  }, [settings, setPreferences, onOpenChange])
  const handleSelectBackground = useCallback(async (value: BackgroundStyle) => {
    if (value.startsWith('wallpaper-')) {
      const wallpaperStore = useWallpaperStore.getState();
      try {
        // Ensure the wallpaper is in the cache
        const cachedUri = await wallpaperStore.getCachedWallpaper(value);
        if (!cachedUri) {
          const wallpaperPath = await getWallpaperPath(value);
          if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
            await wallpaperStore.cacheWallpaper(value, wallpaperPath.uri);
          }
        }
        // Set the wallpaper as current to prevent it from being cleared
        wallpaperStore.setCurrentWallpaper(value);
      } catch (error) {
        console.error(`Failed to cache wallpaper ${value}:`, error);
      }
    }
    
    setSettings((prev) => ({ ...prev, backgroundStyle: value }))
  }, [])
  const [wallpaperSources, setWallpaperSources] = useState<Record<string, ImageSourcePropType>>({});

  useEffect(() => {
    const loadWallpapers = async () => {
      // Default gradient source
      const sources: Record<string, ImageSourcePropType> = {
        'gradient': { uri: '' }
      };
      
      for (const style of backgroundStyles) {
        if (style.value === 'gradient') continue;
        
        try {
          const wallpaperStore = useWallpaperStore.getState();
          
          // First try to get from cache
          const cachedUri = await wallpaperStore.getCachedWallpaper(style.value);
          if (cachedUri) {
            sources[style.value] = { uri: cachedUri };
            continue;
          }
          
          // If not in cache, try to get from getWallpaperPath
          const wallpaperPath = await getWallpaperPath(style.value);
          if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
            sources[style.value] = wallpaperPath;
            
            // Cache for future use
            await wallpaperStore.cacheWallpaper(style.value, wallpaperPath.uri);
          }
        } catch (error) {
          console.error(`Failed to load wallpaper ${style.value}:`, error);
        }
      }
      
      setWallpaperSources(sources);
    };
    
    loadWallpapers();
  }, []);

  const getWallpaperImageSource = useCallback((style: BackgroundStyle): ImageSourcePropType | undefined => {
    return wallpaperSources[style];
  }, [wallpaperSources])
  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} dismissOnSnapToBottom snapPoints={isWeb ? [90] : [82]} zIndex={100000} animation="quick">
      <Sheet.Overlay animation="quick" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} backgroundColor="rgba(0,0,0,0.5)" opacity={0.8} />
      <Sheet.Frame backgroundColor={isDark ? '#111' : '#ffffff'} padding="$4" gap="$3"
        {...(isWeb ? {style: { overflowY: 'auto', maxHeight: '90vh', maxWidth: 600, margin: '0 auto', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)'}} : {})}>
        <Sheet.Handle backgroundColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} />
        <XStack width="100%" justifyContent="flex-end" position="absolute" top="$4" right="$3" zIndex={1000}>
        <Text fontSize={16} fontWeight="bold" color={isDark ? '#fff' : '#000'} fontFamily="$body" opacity={0.7} pressStyle={{ opacity: 0.5 }} onPress={() => onOpenChange(false)}>
            ✕
          </Text>
        </XStack>
        <YStack gap="$3" paddingBottom="$3">
          <XStack gap="$3" flexWrap="wrap">
            <YStack width={60} gap="$2" alignItems="center">
              <Circle size={60} borderWidth={1} borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} borderStyle="dashed" backgroundColor={isDark ? '#333' : '#f5f5f5'} onPress={pickImage} overflow="hidden">
                {settings.profilePicture ? (
                  <Image source={buildImageSource(settings.profilePicture)} style={{ width: 60, height: 60, borderRadius: 30 }} />
                ) : (
                  <Text color={isDark ? '#fff' : '#000'} fontSize={11} fontFamily="$body">
                    Profile
                  </Text>
                )}
              </Circle>
            </YStack>
            <YStack gap="$3" flex={1}>
              <XStack gap="$3" flexWrap="wrap">
                <YStack width={110} gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Username
                  </Text>
                  <DebouncedInput 
                    size="$3" 
                    placeholder="Enter username" 
                    value={settings.username} 
                    onDebouncedChange={(text) => setSettings((prev) => ({ ...prev, username: text }))} 
                    backgroundColor={isDark ? '#333' : '#f5f5f5'} 
                    color={isDark ? '#fff' : '#000'} 
                    borderWidth={isDark ? 0 : 1}
                    borderColor={isDark ? undefined : 'rgba(0,0,0,0.1)'}
                  />
                </YStack>
                <YStack width={110} gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Zip Code
                  </Text>
                  <DebouncedInput 
                    size="$3" 
                    placeholder="Enter zip code" 
                    value={settings.zipCode} 
                    onDebouncedChange={(text) => setSettings((prev) => ({ ...prev, zipCode: text }))} 
                    backgroundColor={isDark ? '#333' : '#f5f5f5'} 
                    color={isDark ? '#fff' : '#000'} 
                    borderWidth={isDark ? 0 : 1}
                    borderColor={isDark ? undefined : 'rgba(0,0,0,0.1)'}
                  />
                </YStack>
              </XStack>
            </YStack>
          </XStack>
          {Platform.OS !== 'web' ? (
            <YStack mt="$2" padding="$3" borderRadius="$4" backgroundColor={isDark ? '#1a1a1a' : '#f7f7f7'}>
              <YStack gap="$3"> 
                <XStack gap="$4" justifyContent="space-around"> 
                  <YStack alignItems="center" gap={4} flex={1}> 
                    <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Quote</Text>
                  <Switch value={settings.quoteEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, quoteEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1 }, { scaleY: 1}] }} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}> 
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Stocks</Text>
                  <Switch value={settings.portfolioEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, portfolioEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1 }, { scaleY: 1}] }} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}> 
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Weather</Text>
                  <Switch value={settings.temperatureEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, temperatureEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1 }, { scaleY: 1}] }} />
                </YStack>
              </XStack>
              <XStack gap="$4" justifyContent="space-around"> 
                <YStack alignItems="center" gap={4} flex={1}> 
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Network</Text>
                  <Switch value={settings.wifiEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, wifiEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1 }, { scaleY: 1}] }} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}> 
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">Notifications</Text>
                  <Switch value={settings.notificationsEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, notificationsEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1 }, { scaleY: 1 }] }} />
                </YStack>
                <YStack alignItems="center" gap={4} flex={1}>
                  <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Primary Color
                  </Text>
                  <Circle size={36} backgroundColor={settings.primaryColor} pressStyle={{ scale: 0.97 }} onPress={() => setColorPickerOpen(true)} />
                  </YStack>
                </XStack>
              </YStack>
            </YStack>
          ) : (
            <YStack mt="$2" padding="$3" borderRadius="$4" backgroundColor={isDark ? '#1a1a1a' : '#f7f7f7'}>
              <XStack gap="$4" flexWrap="wrap" justifyContent="flex-start" alignItems="center">
                <YStack alignItems="center" gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Quote
                </Text>
                <Switch value={settings.quoteEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, quoteEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
              </YStack>
               <YStack alignItems="center" gap="$1">
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Stocks
                </Text>
                <Switch value={settings.portfolioEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, portfolioEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
              </YStack>
               <YStack alignItems="center" gap="$1">
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Weather
                </Text>
                <Switch value={settings.temperatureEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, temperatureEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
              </YStack>
               <YStack alignItems="center" gap="$1">
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Network
                </Text>
                <Switch value={settings.wifiEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, wifiEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Notifications
                </Text>
                <Switch value={settings.notificationsEnabled} onValueChange={(val) => setSettings((prev) => ({ ...prev, notificationsEnabled: val }))} thumbColor="#fff" trackColor={{ false: '#555', true: settings.primaryColor }} style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
              </YStack>
              <YStack alignItems="center" gap="$1">
                <Text fontSize={13} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Primary Color
                </Text>
                  <Circle size={36} backgroundColor={settings.primaryColor} pressStyle={{ scale: 0.97 }} onPress={() => setColorPickerOpen(true)} />
                </YStack>
              </XStack>
            </YStack>
          )}
          <YStack gap="$2" mt="$3">
            <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
              Wallpaper Selection
            </Text>
            <YStack>
              {Array.from({ length: Math.ceil(filteredBackgroundStyles.length / 3) }).map((_, rowIndex) => (
                <XStack key={`row-${rowIndex}`} height={75} marginBottom={8}>
                  {filteredBackgroundStyles.slice(rowIndex * 3, rowIndex * 3 + 3).map((styleItem, index) => (
                    <OptimizedWallpaperButton
                      key={styleItem.value}
                      styleItem={styleItem}
                      isSelected={settings.backgroundStyle === styleItem.value}
                      isDark={isDark}
                      primaryColor={settings.primaryColor}
                      isWeb={isWeb}
                      onSelect={handleSelectBackground}
                      getWallpaperImageSource={getWallpaperImageSource}
                      index={index}
                      totalInRow={3}
                    />
                  ))}
                  {rowIndex === Math.ceil(filteredBackgroundStyles.length / 3) - 1 &&
                    filteredBackgroundStyles.length % 3 !== 0 &&
                    Array.from({ length: 3 - (filteredBackgroundStyles.length % 3) }).map((_, i) => (
                      <YStack key={`empty-${i}`} flex={1} height="100%" marginRight={i < 2 - (filteredBackgroundStyles.length % 3) ? 8 : 0} />
                    ))}
                </XStack>
              ))}
            </YStack>
            {isWeb && backgroundStyles.length > wallpapersToShow && (
              <Button
                size="$2"
                alignSelf="flex-start"
                backgroundColor={isDark ? '#333' : '#f5f5f5'}
                onPress={() => setWallpapersToShow(wallpapersToShow >= backgroundStyles.length ? 8 : Math.min(wallpapersToShow + 4, backgroundStyles.length))}
              >
                <Text color={isDark ? '#fff' : '#000'} fontSize={12} fontFamily="$body">
                  {wallpapersToShow >= backgroundStyles.length ? 'Show Less' : 'Show More'}
                </Text>
              </Button>
            )}
          </YStack>
          <XStack justifyContent="flex-end" mt={Platform.OS === 'android' ? 0 : "$4"}>
            <Button backgroundColor={settings.primaryColor} height={40} paddingHorizontal={20} pressStyle={{ opacity: 0.8 }} onPress={handleSave}>
              <Text color="#fff" fontWeight="500" fontSize={14} fontFamily="$body">
                Save
              </Text>
            </Button>
          </XStack>
          <ColorPickerModal
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            selectedColor={settings.primaryColor}
            onColorChange={(color) => setSettings((prev) => ({ ...prev, primaryColor: color }))}
            colorOptions={colorOptions}
            isDark={isDark}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
