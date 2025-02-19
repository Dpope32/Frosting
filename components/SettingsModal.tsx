import React, { useState } from 'react'
import { useColorScheme, Image, Switch } from 'react-native'
import { Sheet, Button, Input, YStack, XStack, Text, Circle } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { useUserStore } from '@/store/UserStore'
import { colorOptions } from '../constants/Colors'
import { backgroundStyles, BackgroundStyle, getWallpaperPath } from '../constants/Backgrounds'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const backgroundColor = isDark ? 'rgba(28,28,28,0.95)' : 'rgba(255,255,255,0.95)'
  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  const inputBackgroundColor = isDark ? '#333' : '#f5f5f5'
  const inputTextColor = isDark ? '#fff' : '#000'
  const buttonTextColor = '#fff'
  
  // Rest of the state and handlers remain the same...
  const { preferences, setPreferences } = useUserStore()
  const [settings, setSettings] = useState({
    username: preferences.username,
    primaryColor: preferences.primaryColor,
    profilePicture: preferences.profilePicture || '',
    zipCode: preferences.zipCode,
    backgroundStyle: preferences.backgroundStyle,
    notificationsEnabled: preferences.notificationsEnabled,
    quoteEnabled: preferences.quoteEnabled ?? true
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const handleSelectBackground = (value: BackgroundStyle) => {
    setSettings(prev => ({ ...prev, backgroundStyle: value }))
  }

  const wallpaperSelected = settings.backgroundStyle.startsWith('wallpaper-')

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPoints={[85]}
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
        backgroundColor={backgroundColor}
        padding="$4"
        gap="$3"
      >
        <Sheet.Handle backgroundColor={borderColor} />

        <YStack gap="$3" paddingBottom="$3">
          <Text fontSize={20} fontWeight="600" color={textColor}>
            Settings
          </Text>

          {/* Profile and Grid Layout */}
          <XStack gap="$3">
            {/* Profile Picture */}
            <Circle
              size={80}
              borderWidth={1}
              borderColor={borderColor}
              borderStyle="dashed"
              backgroundColor={inputBackgroundColor}
              marginTop={20}
              marginRight={12}
              onPress={pickImage}
              overflow="hidden"
            >
              {settings.profilePicture ? (
                <Image
                  source={{ uri: settings.profilePicture }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <Text color={textColor} fontSize={11}>
                  Profile
                </Text>
              )}
            </Circle>

            {/* 2x2 Grid Layout */}
            <YStack gap="$3" flex={1}>
              <XStack gap="$3">
                {/* Username Input */}
                <YStack width={120} gap="$1">
                  <Text fontSize={14} color={textColor}>
                    Username
                  </Text>
                  <Input
                    size="$3"
                    placeholder="Enter username"
                    value={settings.username}
                    onChangeText={text => setSettings(prev => ({ ...prev, username: text }))}
                    backgroundColor={inputBackgroundColor}
                    color={inputTextColor}
                    borderWidth={0}
                  />
                </YStack>

                {/* Show Quote Toggle */}
                <YStack width={110} gap="$1">
                  <Text fontSize={14} color={textColor}>
                    Show Quote
                  </Text>
                  <XStack
                    backgroundColor={inputBackgroundColor}
                    height={38}
                    borderRadius="$3"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingHorizontal="$2"
                  >
                    <Switch
                      value={settings.quoteEnabled}
                      onValueChange={val =>
                        setSettings(prev => ({ ...prev, quoteEnabled: val }))
                      }
                      thumbColor="#fff"
                      trackColor={{ false: '#555', true: settings.primaryColor }}
                    />
                  </XStack>
                </YStack>
              </XStack>

              <XStack gap="$3">
                {/* Zip Code Input */}
                <YStack width={120} gap="$1">
                  <Text fontSize={14} color={textColor}>
                    Zip Code
                  </Text>
                  <Input
                    size="$3"
                    placeholder="Enter zip code"
                    value={settings.zipCode}
                    onChangeText={text => setSettings(prev => ({ ...prev, zipCode: text }))}
                    backgroundColor={inputBackgroundColor}
                    color={inputTextColor}
                    borderWidth={0}
                  />
                </YStack>

                {/* Notifications Toggle */}
                <YStack width={110} gap="$1">
                  <Text fontSize={14} color={textColor}>
                    Notifications
                  </Text>
                  <XStack
                    backgroundColor={inputBackgroundColor}
                    height={38}
                    borderRadius="$3"
                    alignItems="center"
                    justifyContent="space-between"
                    paddingHorizontal="$2"
                  >
                    <Switch
                      value={settings.notificationsEnabled}
                      onValueChange={val =>
                        setSettings(prev => ({ ...prev, notificationsEnabled: val }))
                      }
                      thumbColor="#fff"
                      trackColor={{ false: '#555', true: settings.primaryColor }}
                    />
                  </XStack>
                </YStack>
              </XStack>
            </YStack>
          </XStack>

          {/* Background Section */}
          <YStack gap="$2">
            <Text fontSize={14} color={textColor}>
              Background
            </Text>
            <XStack gap="$3">
              <Button
                size="$3"
                flex={1}
                backgroundColor={
                  !wallpaperSelected && settings.backgroundStyle.includes('gradient')
                    ? settings.primaryColor
                    : inputBackgroundColor
                }
                borderColor={borderColor}
                borderWidth={1}
                onPress={() => handleSelectBackground('gradient')}
              >
                <Text 
                  color={!wallpaperSelected && settings.backgroundStyle.includes('gradient') 
                    ? buttonTextColor 
                    : textColor} 
                  fontSize={12}
                >
                  Gradient
                </Text>
              </Button>

              <Button
                size="$3"
                flex={1}
                backgroundColor={wallpaperSelected ? settings.primaryColor : inputBackgroundColor}
                borderColor={borderColor}
                borderWidth={1}
                onPress={() => handleSelectBackground('wallpaper-1')}
              >
                <Text 
                  color={wallpaperSelected ? buttonTextColor : textColor} 
                  fontSize={12}
                >
                  Wallpapers
                </Text>
              </Button>
            </XStack>
          </YStack>

          {/* Wallpaper Grid */}
          {wallpaperSelected && (
            <YStack gap="$3">
              <Text fontSize={14} color={textColor}>
                Wallpaper Selection
              </Text>
              <XStack flexWrap="wrap" gap="$1" rowGap="$2" justifyContent="space-between">
                {backgroundStyles.slice(2, 8).map(style => {
                  const imageSource = getWallpaperPath(style.value)
                  const isSelected = settings.backgroundStyle === style.value
                  return (
                    <Button
                      key={style.value}
                      size="$3"
                      width={100}
                      height={62}
                      padding={0}
                      backgroundColor={isSelected ? settings.primaryColor : inputBackgroundColor}
                      borderColor={isSelected ? 'white' : borderColor}
                      borderWidth={isSelected ? 2 : 1}
                      scale={isSelected ? 1.05 : 1}
                      animation="quick"
                      onPress={() => handleSelectBackground(style.value)}
                    >
                      {imageSource ? (
                        <YStack width="100%" height="100%" overflow="hidden" borderRadius={4}>
                          <Image
                            source={imageSource}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 4
                            }}
                            resizeMode="cover"
                          />
                        </YStack>
                      ) : (
                        <YStack
                          backgroundColor="#555"
                          width="100%"
                          height="100%"
                          borderRadius={4}
                        />
                      )}
                    </Button>
                  )
                })}
              </XStack>
            </YStack>
          )}

          {/* Primary Color */}
          <YStack gap="$2" marginBottom={12}>
            <Text fontSize={14} color={textColor}>
              Primary Color
            </Text>
            <XStack flexWrap="wrap" gap="$2">
              {colorOptions.map(color => (
                <Circle
                  key={color.label}
                  size={34}
                  backgroundColor={color.value}
                  borderWidth={settings.primaryColor === color.value ? 2 : 0}
                  borderColor="white"
                  onPress={() => setSettings(prev => ({ ...prev, primaryColor: color.value }))}
                >
                  {settings.primaryColor === color.value && (
                    <Text color="#fff" fontSize={16}>
                      ✓
                    </Text>
                  )}
                </Circle>
              ))}
            </XStack>
          </YStack>

          {/* Save Button */}
          <Button
            backgroundColor={settings.primaryColor}
            height={45}
            width={150}
            pressStyle={{ opacity: 0.8 }}
            onPress={handleSave}
            alignSelf="flex-end"
          >
            <Text color="#fff" fontWeight="500">
              Save Settings
            </Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
