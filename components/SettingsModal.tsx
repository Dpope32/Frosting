import React, { useState } from 'react'
import { useColorScheme, Image, Switch, ScrollView } from 'react-native'
import { Sheet, Button, Input, YStack, XStack, Text, Circle } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { useUserStore } from '@/store/UserStore'
import { colorOptions } from '../constants/Colors'
import { backgroundStyles, BackgroundStyle, getWallpaperPath } from '../constants/Backgrounds'
import { ColorPickerModal } from './ColorPickerModal'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'

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

// Helper component for wallpaper buttons
const WallpaperButton = ({ 
  style, 
  isSelected, 
  onPress, 
  settings, 
  inputBackgroundColor, 
  borderColor 
}: WallpaperButtonProps) => {
  const imageSource = getWallpaperPath(style.value)
  return (
    <Button
      size="$3"
      width={95}
      height={85}
      padding={0}
      backgroundColor={isSelected ? settings.primaryColor : inputBackgroundColor}
      borderColor={isSelected ? 'white' : borderColor}
      borderWidth={isSelected ? 2 : 1}
      scale={isSelected ? 1 : 1.05}
      animation="quick"
      onPress={onPress}
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
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { preferences, setPreferences } = useUserStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [showAllWallpapers, setShowAllWallpapers] = useState(false)

  // Theme-aware colors
  const backgroundColor = isDark ? "rgb(25, 25, 25)" : "#f5f5f5"
  const textColor = isDark ? "#fff" : "#000"
  const mutedTextColor = isDark ? "#a0a0a0" : "#666666"
  const borderColor = isDark ? "rgba(255, 255, 255, 0.68)" : "rgba(0, 0, 0, 0.1)"
  const inputBackgroundColor = isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.8)"
  const inputTextColor = isDark ? "#fff" : "#000"
  const buttonTextColor = "#fff"
  const successColor = isDark ? "#22c55e" : "#16a34a"
  
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

  // Filter out gradient and get all wallpapers
  const wallpapers = backgroundStyles.filter(style => style.value !== 'gradient')
  
  // Show only first 3 wallpapers unless "Show More" is clicked
  const visibleWallpapers = showAllWallpapers ? wallpapers : wallpapers.slice(0, 3)

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPoints={[70]}
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

        <YStack flex={1} gap="$3">
          <Text fontSize={20} fontWeight="600" color={textColor}>
            Settings
          </Text>

          {/* Main Content */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <YStack gap="$3" pb="$3">
              {/* Profile Picture, Username, and Zip Code Row */}
              <XStack gap="$3" alignItems="center">
                {/* Profile Picture */}
                <Circle
                  size={80}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderStyle="dashed"
                  backgroundColor={inputBackgroundColor}
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
                    borderWidth={1}
                    borderColor={borderColor}
                  />
                </YStack>

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
                    borderWidth={1}
                    borderColor={borderColor}
                  />
                </YStack>
              </XStack>

              {/* Theme Settings Container */}
              <YStack 
                backgroundColor={inputBackgroundColor} 
                padding="$3" 
                borderRadius="$3"
                borderWidth={1}
                borderColor={borderColor}
              >
                <XStack gap="$4" justifyContent="space-between">
                  {/* Theme Color */}
                  <YStack width={110} gap="$1">
                    <Text fontSize={14} color={textColor}>
                      Theme Color
                    </Text>
                    <XStack gap="$2" alignItems="center">
                      <Circle
                        size={34}
                        backgroundColor={settings.primaryColor}
                        pressStyle={{ scale: 0.97 }}
                        onPress={() => setColorPickerOpen(true)}
                        borderWidth={1}
                        borderColor={borderColor}
                      />
                      <Button
                        size="$2"
                        onPress={() => setColorPickerOpen(true)}
                        backgroundColor="transparent"
                      >
                        <Text color={textColor} fontSize={11}>Edit</Text>
                      </Button>
                    </XStack>
                  </YStack>

                  {/* Show Quote Toggle */}
                  <YStack width={110} gap="$1">
                    <Text fontSize={14} color={textColor}>
                      Show Quote
                    </Text>
                    <XStack
                      height={38}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Switch
                        value={settings.quoteEnabled}
                        onValueChange={val =>
                          setSettings(prev => ({ ...prev, quoteEnabled: val }))
                        }
                        thumbColor="#fff"
                        trackColor={{ false: isDark ? '#333' : '#e5e5e5', true: successColor }}
                      />
                    </XStack>
                  </YStack>

                  {/* Notifications Toggle */}
                  <YStack width={110} gap="$1">
                    <Text fontSize={14} color={textColor}>
                      Notifications
                    </Text>
                    <XStack
                      height={38}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Switch
                        value={settings.notificationsEnabled}
                        onValueChange={val =>
                          setSettings(prev => ({ ...prev, notificationsEnabled: val }))
                        }
                        thumbColor="#fff"
                        trackColor={{ false: isDark ? '#333' : '#e5e5e5', true: successColor }}
                      />
                    </XStack>
                  </YStack>
                </XStack>
              </YStack>

              {/* Wallpaper Section */}
              <YStack gap="$2">
                <Text fontSize={14} color={textColor}>
                  Wallpaper
                </Text>
                <XStack 
                  columnGap="$1"
                  rowGap="$2"
                  flexWrap="wrap" 
                  justifyContent="space-between"
                  paddingLeft={2}
                >
                  {/* Gradient Option */}
                  <Button
                    size="$3"
                    width={95}
                    height={85}
                    padding={0}
                    backgroundColor={settings.backgroundStyle === 'gradient' ? settings.primaryColor : inputBackgroundColor}
                    borderColor={settings.backgroundStyle === 'gradient' ? 'white' : borderColor}
                    borderWidth={settings.backgroundStyle === 'gradient' ? 2 : 1}
                    scale={settings.backgroundStyle === 'gradient' ? 1 : 1.05}
                    animation="quick"
                    onPress={() => handleSelectBackground('gradient')}
                  >
                    <YStack
                      width="100%"
                      height="100%"
                      borderRadius={4}
                      backgroundColor={settings.primaryColor}
                      opacity={0.8}
                    />
                  </Button>

                  {/* Wallpaper Options */}
                  {visibleWallpapers.map(style => (
                    <WallpaperButton
                      key={style.value}
                      style={style}
                      isSelected={settings.backgroundStyle === style.value}
                      onPress={() => handleSelectBackground(style.value)}
                      settings={settings}
                      inputBackgroundColor={inputBackgroundColor}
                      borderColor={borderColor}
                    />
                  ))}
                </XStack>

                {/* Show More/Less Button - Only show if we have more than 2 wallpapers */}
                {wallpapers.length > 2 && (
                  <Button
                    size="$2"
                    onPress={() => {
                      setShowAllWallpapers(!showAllWallpapers)
                    }}
                    icon={showAllWallpapers ? ChevronUp : ChevronDown}
                    width={95}
                    backgroundColor="transparent"
                  >
                    <Text color={textColor} fontSize={11}>
                      {showAllWallpapers ? 'Show Less' : 'Show More'}
                    </Text>
                  </Button>
                )}
              </YStack>
            </YStack>
          </ScrollView>

          {/* Save Button */}
          <XStack justifyContent="flex-end" padding="$3">
            <Button
              backgroundColor={settings.primaryColor}
              height={38}
              width={120}
              pressStyle={{ opacity: 0.8 }}
              onPress={handleSave}
              borderWidth={1}
              borderColor={borderColor}
              paddingHorizontal="$3"
            >
              <Text color="#fff" fontWeight="500" fontSize={13}>
                Save Settings
              </Text>
            </Button>
          </XStack>
        </YStack>

        {/* Color Picker Modal */}
        <ColorPickerModal
          open={colorPickerOpen}
          onOpenChange={setColorPickerOpen}
          selectedColor={settings.primaryColor}
          onColorChange={(color) => setSettings(prev => ({ ...prev, primaryColor: color }))}
          colorOptions={colorOptions}
          isDark={isDark}
        />
      </Sheet.Frame>
    </Sheet>
  )
}
