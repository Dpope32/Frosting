import React, { useState, useMemo } from 'react'
import {
  Image,
  ImageSourcePropType,
  Platform,
  Switch,
  useColorScheme,
} from 'react-native'
import { Sheet, Button, Input, YStack, XStack, Text, Circle } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { colorOptions } from '../constants/Colors'
import {
  backgroundStyles,
  BackgroundStyle,
  getWallpaperPath,
} from '../constants/Backgrounds'
import { ColorPickerModal } from './ColorPickerModal'

// Only import ImagePicker on native platforms
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

interface WallpaperButtonProps {
  style: { value: BackgroundStyle; label: string }
  isSelected: boolean
  onPress: () => void
  settings: {
    primaryColor: string
    backgroundStyle: BackgroundStyle
  }
  inputBackgroundColor: string
  borderColor: string
}


export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { preferences, setPreferences } = useUserStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  const [wallpapersToShow, setWallpapersToShow] = useState(4)
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [settings, setSettings] = useState({
    username: preferences.username,
    primaryColor: preferences.primaryColor,
    // Make profilePicture a string | undefined so we never store null
    profilePicture: preferences.profilePicture || undefined,
    zipCode: preferences.zipCode,
    backgroundStyle: preferences.backgroundStyle,
    notificationsEnabled: preferences.notificationsEnabled,
    quoteEnabled: preferences.quoteEnabled ?? true,
  })

  // On web, optionally limit how many are shown at first
  const filteredBackgroundStyles = useMemo(() => {
    if (!isWeb || wallpapersToShow >= backgroundStyles.length) return backgroundStyles
    return backgroundStyles.slice(0, wallpapersToShow)
  }, [isWeb, wallpapersToShow, backgroundStyles])

  // Convert a string (URI) to an ImageSourcePropType, or return undefined
  function buildImageSource(uri?: string): ImageSourcePropType | undefined {
    if (!uri) return undefined
    return { uri }
  }

  // On each platform, pick an image
  async function pickImage() {
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
              // Convert to string, never store null
              setSettings((prev) => ({
                ...prev,
                profilePicture: String(target.result),
              }))
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
        setSettings((prev) => ({
          ...prev,
          profilePicture: result.assets[0].uri,
        }))
      }
    }
  }

  // Save final settings
  function handleSave() {
    setPreferences({ ...settings })
    onOpenChange(false)
  }

  // When user selects a background, it must match the union type
  function handleSelectBackground(value: BackgroundStyle) {
    setSettings((prev) => ({ ...prev, backgroundStyle: value }))
  }

  // Get wallpaper image source safely
  function getWallpaperImageSource(style: BackgroundStyle): ImageSourcePropType | undefined {
    const wallpaperPath = getWallpaperPath(style);
    if (wallpaperPath && wallpaperPath.uri) {
      return { uri: wallpaperPath.uri };
    }
    
    // Fallback to local assets for specific styles
    if (style === 'space') {
      return require('@/assets/wallpapers/wallpapers-3.png');
    } else if (style === 'silhouette') {
      return require('@/assets/wallpapers/wallpapers-4.png');
    }
    
    // Default fallback
    return undefined;
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPoints={[80]}
      zIndex={100000}
      animation="quick"
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
        opacity={0.8}
      />
      <Sheet.Frame
        backgroundColor={isDark ? '#1c1c1c' : '#ffffff'}
        padding="$4"
        gap="$3"
        {...(isWeb
          ? {
              style: {
                overflowY: 'auto',
                maxHeight: '90vh',
                maxWidth: 600,
                margin: '0 auto',
                borderRadius: 8,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              },
            }
          : {})}
      >
        <Sheet.Handle
          backgroundColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
        />
        <XStack width="100%" justifyContent="flex-end" position="absolute" top="$2" right="$3" zIndex={1000}>
          <Circle
            size={30}
            backgroundColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => onOpenChange(false)}
          >
            <Text fontSize={16} fontWeight="bold" color={isDark ? '#fff' : '#000'} fontFamily="$body">
              ✕
            </Text>
          </Circle>
        </XStack>
        <YStack gap="$3" paddingBottom="$3">
          <Text fontSize={20} fontWeight="600" color={isDark ? '#fff' : '#000'} fontFamily="$body">
            Settings
          </Text>
          <XStack gap="$3" flexWrap="wrap">
            <Circle
              size={isWeb ? 70 : 60}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
              borderStyle="dashed"
              backgroundColor={isDark ? '#333' : '#f5f5f5'}
              marginRight={12}
              onPress={pickImage}
              overflow="hidden"
            >
              {settings.profilePicture ? (
                <Image
                  source={buildImageSource(settings.profilePicture)}
                  style={{
                    width: isWeb ? 70 : 60,
                    height: isWeb ? 70 : 60,
                    borderRadius: isWeb ? 35 : 30,
                  }}
                />
              ) : (
                <Text color={isDark ? '#fff' : '#000'} fontSize={11} fontFamily="$body">
                  Profile
                </Text>
              )}
            </Circle>

            <YStack gap="$3" flex={1}>
              <XStack gap="$3" flexWrap="wrap">
                <YStack width={isWeb ? 150 : 120} gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Username
                  </Text>
                  <Input
                    size="$3"
                    placeholder="Enter username"
                    value={settings.username}
                    onChangeText={(text) =>
                      setSettings((prev) => ({ ...prev, username: text }))
                    }
                    backgroundColor={isDark ? '#333' : '#f5f5f5'}
                    color={isDark ? '#fff' : '#000'}
                    borderWidth={0}
                  />
                </YStack>

                <YStack width={isWeb ? 150 : 120} gap="$1">
                  <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                    Zip Code
                  </Text>
                  <Input
                    size="$3"
                    placeholder="Enter zip code"
                    value={settings.zipCode}
                    onChangeText={(text) =>
                      setSettings((prev) => ({ ...prev, zipCode: text }))
                    }
                    backgroundColor={isDark ? '#333' : '#f5f5f5'}
                    color={isDark ? '#fff' : '#000'}
                    borderWidth={0}
                  />
                </YStack>
              </XStack>

              {isWeb ? (
                <XStack gap="$3" marginTop="$2" flexWrap="wrap">
                  <YStack width={100} gap="$1">
                    <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                      Show Quote
                    </Text>
                    <Switch
                      value={settings.quoteEnabled}
                      onValueChange={(val) =>
                        setSettings((prev) => ({ ...prev, quoteEnabled: val }))
                      }
                      thumbColor="#fff"
                      trackColor={{
                        false: '#555',
                        true: settings.primaryColor,
                      }}
                    />
                  </YStack>
                  <YStack width={120} gap="$1">
                    <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                      Notifications
                    </Text>
                    <Switch
                      value={settings.notificationsEnabled}
                      onValueChange={(val) =>
                        setSettings((prev) => ({ ...prev, notificationsEnabled: val }))
                      }
                      thumbColor="#fff"
                      trackColor={{
                        false: '#555',
                        true: settings.primaryColor,
                      }}
                    />
                  </YStack>
                  <YStack gap="$1" alignItems="flex-start">
                    <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                      Primary Color
                    </Text>
                    <XStack alignItems="center" gap="$2">
                      <Circle
                        size={30}
                        backgroundColor={settings.primaryColor}
                        pressStyle={{ scale: 0.97 }}
                        onPress={() => setColorPickerOpen(true)}
                      />
                      <Button
                        size="$2"
                        backgroundColor={isDark ? '#333' : '#f5f5f5'}
                        onPress={() => setColorPickerOpen(true)}
                      >
                        <Text color={isDark ? '#fff' : '#000'} fontSize={12} fontFamily="$body">
                          Customize
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                </XStack>
              ) : (
                <YStack gap="$2">
                  <XStack gap="$3">
                    <YStack width={110} gap="$1">
                      <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                        Show Quote
                      </Text>
                      <Switch
                        value={settings.quoteEnabled}
                        onValueChange={(val) =>
                          setSettings((prev) => ({ ...prev, quoteEnabled: val }))
                        }
                        thumbColor="#fff"
                        trackColor={{
                          false: '#555',
                          true: settings.primaryColor,
                        }}
                      />
                    </YStack>

                    <YStack width={110} gap="$1">
                      <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                        Notifications
                      </Text>
                      <Switch
                        value={settings.notificationsEnabled}
                        onValueChange={(val) =>
                          setSettings((prev) => ({ ...prev, notificationsEnabled: val }))
                        }
                        thumbColor="#fff"
                        trackColor={{
                          false: '#555',
                          true: settings.primaryColor,
                        }}
                      />
                    </YStack>
                  </XStack>

                  <YStack gap="$2">
                    <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
                      Primary Color
                    </Text>
                    <XStack alignItems="center" justifyContent="flex-start" gap="$2">
                      <Circle
                        size={34}
                        backgroundColor={settings.primaryColor}
                        pressStyle={{ scale: 0.97 }}
                        onPress={() => setColorPickerOpen(true)}
                      />
                      <Button
                        size="$2"
                        backgroundColor={isDark ? '#333' : '#f5f5f5'}
                        onPress={() => setColorPickerOpen(true)}
                      >
                        <Text color={isDark ? '#fff' : '#000'} fontSize={12} fontFamily="$body">
                          Customize
                        </Text>
                      </Button>
                    </XStack>
                  </YStack>
                </YStack>
              )}
            </YStack>
          </XStack>

          {/* Wallpaper selection */}
          <YStack gap="$2" marginTop="$2">
            <Text fontSize={14} color={isDark ? '#fff' : '#000'} fontFamily="$body">
              Wallpaper Selection
            </Text>
            <XStack
              flexWrap="wrap"
              gap={isWeb ? "$3" : "$2"}
              rowGap={isWeb ? "$3" : "$2"}
              justifyContent="flex-start"
              paddingHorizontal="$1"
              marginTop="$2"
              {...(isWeb ? {
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  width: '100%'
                }
              } : {})}
            >
              {filteredBackgroundStyles.map((style) => {
                const isSelected = settings.backgroundStyle === style.value
                const borderColor = isSelected
                  ? 'white'
                  : isDark
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(0,0,0,0.2)'
                
                return (
                  <Button
                    key={style.value}
                    size="$3"
                    width={isWeb ? "auto" : 95}
                    height={isWeb ? 90 : 65}
                    padding={0}
                    backgroundColor={
                      isSelected ? settings.primaryColor : isDark ? '#333' : '#f5f5f5'
                    }
                    borderColor={borderColor}
                    borderWidth={isSelected ? 2 : 1}
                    scale={isSelected ? 1.05 : 1}
                    onPress={() => handleSelectBackground(style.value)}
                    {...(isWeb ? { style: { width: '100%' } } : {})}
                  >
                    {style.value === 'gradient' ? (
                      <YStack
                        width="100%"
                        height="100%"
                        borderRadius={4}
                        {...(isWeb
                          ? { 
                              style: { 
                                background: 'linear-gradient(120deg, #3a7bd5, #00d2ff, #3a7bd5)',
                                backgroundSize: '200% 200%',
                                animation: 'gradientAnimation 5s ease infinite',
                                position: 'relative',
                              } 
                            }
                          : { backgroundColor: '#3a7bd5' })}
                      >
                        {isWeb && (
                          <style dangerouslySetInnerHTML={{ __html: `
                            @keyframes gradientAnimation {
                              0% { background-position: 0% 50% }
                              50% { background-position: 100% 50% }
                              100% { background-position: 0% 50% }
                            }
                          `}} />
                        )}
                      </YStack>
                    ) : (
                      <YStack width="100%" height="100%" overflow="hidden" borderRadius={4}>
                        <Image
                          source={getWallpaperImageSource(style.value)}
                          style={{ width: '100%', height: '100%', borderRadius: 4 }}
                          resizeMode="cover"
                          {...(isWeb ? { loading: 'lazy' } : {})}
                        />
                      </YStack>
                    )}
                  </Button>
                )
              })}
            </XStack>

            {isWeb && backgroundStyles.length > 4 && (
              <Button
                size="$2"
                alignSelf="flex-start"
                backgroundColor={isDark ? '#333' : '#f5f5f5'}
                onPress={() => {
                  if (wallpapersToShow >= backgroundStyles.length) {
                    // Show Less - reset to initial 4
                    setWallpapersToShow(4);
                  } else {
                    // Show More - add 4 more (one more row)
                    setWallpapersToShow(Math.min(wallpapersToShow + 4, backgroundStyles.length));
                  }
                }}
              >
                <Text color={isDark ? '#fff' : '#000'} fontSize={12} fontFamily="$body">
                  {wallpapersToShow >= backgroundStyles.length ? "Show Less Wallpapers" : "Show More Wallpapers"}
                </Text>
              </Button>
            )}
          </YStack>

          {/* Save Button */}
          <XStack justifyContent="flex-end" marginTop="$3">
            <Button
              backgroundColor={settings.primaryColor}
              height={38}
              width={120}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleSave}
            >
              <Text color="#fff" fontWeight="500" fontSize={13} fontFamily="$body">
                Save Settings
              </Text>
            </Button>
          </XStack>

          {/* Color Picker */}
          <ColorPickerModal
            open={colorPickerOpen}
            onOpenChange={setColorPickerOpen}
            selectedColor={settings.primaryColor}
            onColorChange={(color) =>
              setSettings((prev) => ({ ...prev, primaryColor: color }))
            }
            colorOptions={colorOptions}
            isDark={isDark}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
