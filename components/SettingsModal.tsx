import React, { useState } from 'react'
import { Sheet, Button, Input, YStack, XStack, Text, Circle, ScrollView, Stack } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'react-native'
import { colorOptions } from '../constants/ColorOptions'
import { backgroundStyles, BackgroundStyle, getWallpaperPath } from '../constants/BackgroundStyles'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { preferences, setPreferences } = useUserStore()
  const [settings, setSettings] = useState<{
    username: string
    primaryColor: string
    profilePicture: string
    zipCode: string
    backgroundStyle: BackgroundStyle
  }>({
    username: preferences.username,
    primaryColor: preferences.primaryColor,
    profilePicture: preferences.profilePicture || '',
    zipCode: preferences.zipCode,
    backgroundStyle: preferences.backgroundStyle
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    })
    if (!result.canceled) {
      setSettings(prev => ({
        ...prev,
        profilePicture: result.assets[0].uri
      }))
    }
  }

  const handleSave = () => {
    setPreferences({ ...settings })
    onOpenChange(false)
  }

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPoints={[83]}
      zIndex={100000}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)" 
        opacity={0.8}
      />
      <Sheet.Frame
        backgroundColor="rgba(28,28,28,0.95)"  
        padding="$3"
        gap="$3"
      >
      <Sheet.Handle backgroundColor="rgba(85,85,85,0.5)" /> 
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$2" pb="$5">
            <Text fontSize={20} fontWeight="600" color="#fff">Settings</Text>
            
            {/* Profile Section */}
            <XStack gap="$4" alignItems="flex-start" justifyContent="space-between">
              <Circle
                size={100}
                borderWidth={1}
                borderColor="rgba(255,255,255,0.2)"
                borderStyle="dashed"
                backgroundColor="#333"
                marginLeft="$4"
                marginTop="$4"
                onPress={pickImage}
              >
                {settings.profilePicture ? (
                  <Image
                    source={{ uri: settings.profilePicture }}
                    style={{ width: 100, height: 100, borderRadius: 50 }}
                  />
                ) : (
                  <Text color="#fff" fontSize={12}>Profile Picture</Text>
                )}
              </Circle>

              {/* Background Style Selection */}
              <YStack gap="$2" flex={1} alignItems="flex-end" paddingRight="$8" marginTop={-30} paddingBottom="$4">
                <Text fontSize={14} color="#fff" alignSelf="flex-end" paddingBottom="$1" paddingRight="$4.5">Background</Text>
                {backgroundStyles.slice(0, 2).map(style => (
                  <Button
                    key={style.value}
                    size="$3"
                    width={120}
                    backgroundColor={settings.backgroundStyle === style.value ? settings.primaryColor : '#333'}
                    borderColor="rgba(255,255,255,0.1)"
                    onPress={() => setSettings(prev => ({ ...prev, backgroundStyle: style.value }))}
                  >
                    <Text color="#fff" fontSize={12}>{style.label}</Text>
                  </Button>
                ))}
                <Button
                  size="$3"
                  width={120}
                  backgroundColor={settings.backgroundStyle.startsWith('wallpaper-') ? settings.primaryColor : '#333'}
                  borderColor="rgba(255,255,255,0.1)"
                  onPress={() => setSettings(prev => ({ ...prev, backgroundStyle: 'wallpaper-1' }))}
                >
                  <Text color="#fff" fontSize={12}>Wallpapers</Text>
                </Button>
              </YStack>
            </XStack>

            {/* User Info Section */}
            <YStack gap="$4">
              <XStack gap="$3" flexWrap="wrap">
                <YStack flex={1} minWidth={150} gap="$2">
                  <Text fontSize={14} color="#fff">Username</Text>
                  <Input
                    size="$3"
                    placeholder="Enter username"
                    value={settings.username}
                    onChangeText={text => setSettings(prev => ({ ...prev, username: text }))}
                    backgroundColor="#333"
                    color="#fff"
                    borderWidth={0}
                  />
                </YStack>
                <YStack flex={1} minWidth={150} gap="$2">
                  <Text fontSize={14} color="#fff">Zip Code</Text>
                  <Input
                    size="$3"
                    placeholder="Enter zip code"
                    value={settings.zipCode}
                    onChangeText={text => setSettings(prev => ({ ...prev, zipCode: text }))}
                    backgroundColor="#333"
                    color="#fff"
                    borderWidth={0}
                  />
                </YStack>
              </XStack>

              {/* Color Selection */}
              <YStack gap="$2">
                <Text fontSize={14} color="#fff">Primary Color</Text>
                <XStack flexWrap="wrap" justifyContent="center" gap="$2">
                  {colorOptions.map(color => (
                    <Circle
                      key={color.label}
                      size={40}
                      backgroundColor={color.value}
                      borderWidth={settings.primaryColor === color.value ? 2 : 0}
                      borderColor="white"
                      onPress={() => setSettings(prev => ({ ...prev, primaryColor: color.value }))}
                    >
                      {settings.primaryColor === color.value && (
                        <Text color="#fff" fontSize={16}>✓</Text>
                      )}
                    </Circle>
                  ))}
                </XStack>
              </YStack>

              {/* Wallpaper Selection */}
              {settings.backgroundStyle.startsWith('wallpaper-') && (
                <YStack gap="$2">
                  <Text fontSize={14} color="#fff">Wallpaper Selection</Text>
                  <YStack width="100%">
                    <XStack width="100%" justifyContent="space-between" marginBottom="$4">
                      {backgroundStyles.slice(2, 5).map((style, index) => {
                        const imageSource = getWallpaperPath(style.value);
                        return (
                          <Button
                            key={style.value}
                            size="$3"
                            width={110}
                            height={70}
                            padding={0}
                            backgroundColor={settings.backgroundStyle === style.value ? settings.primaryColor : '#333'}
                            borderColor={settings.backgroundStyle === style.value ? "white" : "rgba(255,255,255,0.1)"}
                            borderWidth={settings.backgroundStyle === style.value ? 2 : 1}
                            scale={settings.backgroundStyle === style.value ? 1.1 : 1}
                            animation="quick"
                            onPress={() => {
                              setSettings(prev => ({...prev, backgroundStyle: style.value }));
                            }}
                          >
                            {imageSource ? (
                              <YStack width={110} height={70} overflow="hidden" borderRadius={4}>
                                <Image
                                  source={imageSource}
                                  style={{ 
                                    width: 110, 
                                    height: 70,
                                    borderRadius: 4
                                  }}
                                  resizeMode="cover"
                                />
                              </YStack>
                            ) : (
                              <YStack backgroundColor="#555" width="100%" height="100%" borderRadius={4} />
                            )}
                          </Button>
                        )
                      })}
                    </XStack>
                    <XStack width="100%" justifyContent="space-between">
                      {backgroundStyles.slice(5, 8).map((style, index) => {
                        const imageSource = getWallpaperPath(style.value);
                        return (
                          <Button
                            key={style.value}
                            size="$3"
                            width={110}
                            height={70}
                            padding={0}
                            backgroundColor={settings.backgroundStyle === style.value ? settings.primaryColor : '#333'}
                            borderColor={settings.backgroundStyle === style.value ? "white" : "rgba(255,255,255,0.1)"}
                            borderWidth={settings.backgroundStyle === style.value ? 2 : 1}
                            scale={settings.backgroundStyle === style.value ? 1.1 : 1}
                            animation="quick"
                            onPress={() => {
                              setSettings(prev => ({...prev, backgroundStyle: style.value }));
                            }}
                          >
                            {imageSource ? (
                              <YStack width={110} height={70} overflow="hidden" borderRadius={4}>
                                <Image
                                  source={imageSource}
                                  style={{ 
                                    width: 110, 
                                    height: 70,
                                    borderRadius: 4
                                  }}
                                  resizeMode="cover"
                                />
                              </YStack>
                            ) : (
                              <YStack backgroundColor="#555" width="100%" height="100%" borderRadius={4} />
                            )}
                          </Button>
                        )
                      })}
                    </XStack>
                  </YStack>
                </YStack>
              )}
            </YStack>

            {/* Save Button */}
            <Button
              backgroundColor={settings.primaryColor}
              height={45}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleSave}
              marginTop="$4"
            >
              <Text color="#fff" fontWeight="500">Save Settings</Text>
            </Button>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}
