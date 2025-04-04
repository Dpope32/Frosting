import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Image, ImageSourcePropType, Platform, Switch, useColorScheme, Alert, View, ActivityIndicator, StyleSheet, Modal } from 'react-native' // Added Modal import
import { BaseCardModal } from '../baseModals/BaseCardModal'
import { router } from 'expo-router';
import { Button, YStack, XStack, Text, Circle, Spinner, isWeb } from 'tamagui';
import { BlurView } from 'expo-blur'

import { StorageUtils } from '@/store/AsyncStorage'
import { useUserStore } from '@/store/UserStore';
import { useBillStore } from '@/store/BillStore'; 
import { useProjectStore } from '@/store/ToDo'; 
import { usePeopleStore } from '@/store/People'; 
import { useWallpaperStore } from '@/store/WallpaperStore';
import { colorOptions } from '../../constants/Colors';
import { backgroundStyles, BackgroundStyle, getWallpaperPath } from '../../constants/Backgrounds';
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
        <YStack width="100%" height="100%" overflow="hidden" br={4} backgroundColor="#242424">
          {getWallpaperImageSource(styleItem.value) ? (
            <Image
              source={getWallpaperImageSource(styleItem.value)}
              style={{ width: '100%', height: '100%', borderRadius: 4 }}
              resizeMode="cover"
              {...(isWeb ? { loading: 'lazy' } : {})}
            />
          ) : (
            <Text color="white" fontSize={10} textAlign="center" padding="$2">
              {styleItem.label}
            </Text>
          )}
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
  const [isSigningOut, setIsSigningOut] = useState(false)
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
        const cachedUri = await wallpaperStore.getCachedWallpaper(value);
        if (!cachedUri) {
          const wallpaperPath = await getWallpaperPath(value);
          if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
            await wallpaperStore.cacheWallpaper(value, wallpaperPath.uri);
          }
        }
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
    const sources: Record<string, ImageSourcePropType> = {
      'gradient': { uri: '' }
    };
    
    for (const style of backgroundStyles) {
      if (style.value === 'gradient') continue;
      
      try {
        const wallpaperStore = useWallpaperStore.getState();
        const wallpaperKey = style.value;
        const cachedUri = await wallpaperStore.getCachedWallpaper(wallpaperKey);
        
        if (cachedUri) {
          sources[wallpaperKey] = { uri: cachedUri };
        } else {
          const wallpaperPath = await getWallpaperPath(wallpaperKey);
          if (wallpaperPath && typeof wallpaperPath === 'object' && 'uri' in wallpaperPath && wallpaperPath.uri) {
            sources[wallpaperKey] = wallpaperPath;
            
            await wallpaperStore.cacheWallpaper(wallpaperKey, wallpaperPath.uri);
          }
        }
      } catch (error) {
        console.error(`[SettingsModal] Failed to load wallpaper ${style.value}:`, error);
      }
    }
    
    setWallpaperSources(sources);
  };
    
    loadWallpapers();
  }, []);

  const getWallpaperImageSource = useCallback((style: BackgroundStyle): ImageSourcePropType | undefined => {
    if (style === 'gradient') {
      return { uri: '' };
    }
    if (wallpaperSources[style]) {
      return wallpaperSources[style];
    }
    return undefined;
  }, [wallpaperSources]);

  return (
    <>
    <BaseCardModal
      open={open}
      onOpenChange={(newOpen) => {
        if (!isSigningOut) {
          onOpenChange(newOpen)
        }
      }}
      title="Settings"
      snapPoints={isWeb ? [90] : [85]}
      zIndex={100000}
      hideHandle={true}
      showCloseButton={!isSigningOut}
    >
      <YStack flex={1} gap="$2" paddingBottom="$2" paddingHorizontal={isWeb ? '$4' : '$4'}>
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
            <YStack mt="$2" py="$2" borderRadius="$4" backgroundColor={isDark ? '#1a1a1a' : '#f7f7f7'}>
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
            <YStack mt="$2" padding="$4" borderRadius="$4" backgroundColor={isDark ? '#1a1a1a' : '#f7f7f7'}>
            <XStack gap="$6" justifyContent="space-between" marginBottom="$4">
              <YStack alignItems="center" gap="$2" width={100}>
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Quote
                </Text>
                <Switch 
                  value={settings.quoteEnabled} 
                  onValueChange={(val) => setSettings((prev) => ({ ...prev, quoteEnabled: val }))} 
                  thumbColor="#fff" 
                  trackColor={{ false: '#555', true: settings.primaryColor }} 
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }} 
                />
              </YStack>
              <YStack alignItems="center" gap="$2" width={100}>
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Stocks
                </Text>
                <Switch 
                  value={settings.portfolioEnabled} 
                  onValueChange={(val) => setSettings((prev) => ({ ...prev, portfolioEnabled: val }))} 
                  thumbColor="#fff" 
                  trackColor={{ false: '#555', true: settings.primaryColor }} 
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }} 
                />
              </YStack>
              <YStack alignItems="center" gap="$2" width={100}>
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Weather
                </Text>
                <Switch 
                  value={settings.temperatureEnabled} 
                  onValueChange={(val) => setSettings((prev) => ({ ...prev, temperatureEnabled: val }))} 
                  thumbColor="#fff" 
                  trackColor={{ false: '#555', true: settings.primaryColor }} 
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }} 
                />
              </YStack>
            </XStack>
            <XStack gap="$6" justifyContent="space-between">
              <YStack alignItems="center" gap="$2" width={100}>
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Network
                </Text>
                <Switch 
                  value={settings.wifiEnabled} 
                  onValueChange={(val) => setSettings((prev) => ({ ...prev, wifiEnabled: val }))} 
                  thumbColor="#fff" 
                  trackColor={{ false: '#555', true: settings.primaryColor }} 
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }} 
                />
              </YStack>
              <YStack alignItems="center" gap="$2" width={100}>
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Notifications
                </Text>
                <Switch 
                  value={settings.notificationsEnabled} 
                  onValueChange={(val) => setSettings((prev) => ({ ...prev, notificationsEnabled: val }))} 
                  thumbColor="#fff" 
                  trackColor={{ false: '#555', true: settings.primaryColor }} 
                  style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }} 
                />
              </YStack>
              <YStack alignItems="center" gap="$2" width={100}>
                <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                  Primary Color
                </Text>
                <Circle 
                  size={34} 
                  backgroundColor={settings.primaryColor} 
                  pressStyle={{ scale: 0.97 }} 
                  onPress={() => setColorPickerOpen(true)} 
                />
              </YStack>
            </XStack>
          </YStack>
          )}
          <YStack gap="$2" >
            <Text fontSize={14} color={isDark ? '#ccc' : '#000'} fontFamily="$body">
              Wallpaper
            </Text>
            <YStack>
              {Array.from({ length: Math.ceil(filteredBackgroundStyles.length / 3) }).map((_, rowIndex) => (
                <XStack key={`row-${rowIndex}`} height={60} marginBottom={8}>
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
          <ColorPickerModal
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            selectedColor={settings.primaryColor}
            onColorChange={(color) => setSettings((prev) => ({ ...prev, primaryColor: color }))}
            colorOptions={colorOptions}
            isDark={isDark}
          />
        </YStack>

      <XStack
        justifyContent="space-between"
        paddingHorizontal={isWeb ? '$4' : '$3'}
        paddingVertical={isWeb ? '$4' : '$3'}
        paddingTop={isWeb ? '$20' : '$3'}
      >
        <Button
          backgroundColor="transparent" height={40} paddingHorizontal={20} pressStyle={{ opacity: 0.8 }}
          disabled={isSigningOut}
          onPress={async () => {
            const message = "Are you sure you want to reset all your data? This cannot be undone..."
            const shouldReset = isWeb
              ? window.confirm(message)
              : await new Promise(resolve => {
                Alert.alert(
                  "Confirm Reset",
                  message,
                  [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                    { text: "Reset", style: "destructive", onPress: () => resolve(true) },
                  ],
                  { cancelable: false }
                )
              });
          
            if (shouldReset) {
              setIsSigningOut(true);
              
              try {
                useBillStore.getState().clearBills();
                useProjectStore.getState().clearTasks();
                usePeopleStore.getState().clearContacts();
                useUserStore.getState().clearPreferences();

                await StorageUtils.clear();

                
                setTimeout(() => {
                  if (isWeb) {
                    window.location.href = '/screens/onboarding';
                  } else {
                    router.replace('/screens/onboarding');
                  }
                }, 300);
              } catch (error) {
                console.error("[SignOut] Error during sign out:", error);
                Alert.alert("Error", "Failed to sign out. Please try again.");
                setIsSigningOut(false);
              }
            }
          }}
          >
            <Text color="$red10" fontWeight="bold" fontFamily="$body" fontSize={14}>
              Sign Out
            </Text>
          </Button>
          <Button
            backgroundColor={settings.primaryColor}
            height={40}
            paddingHorizontal={20}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            disabled={isSigningOut}
          >
            <Text color="#fff" fontWeight="500" fontSize={14} fontFamily="$body">
              Save
            </Text>
          </Button>
        </XStack>
    </BaseCardModal>

    <Modal
      visible={isSigningOut}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}} 
    >
      <View style={styles.overlayContainer}>
        {isWeb ? (
          <View style={styles.webOverlayBackground} />
        ) : (
          <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        )}
        {isWeb ? <ActivityIndicator size="large" color={isDark ? "#FFFFFF" : "#000000"} /> : <Spinner size="large" color="$color" />}
        <Text mt="$3" color={isDark ? '#fff' : '#000'} fontSize={16} fontFamily="$body">Signing Out...</Text>
      </View>
    </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  webOverlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
})
