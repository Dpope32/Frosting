import React from 'react'
import { Image, ImageSourcePropType } from 'react-native'
import { YStack, XStack, Text, Circle, isWeb } from 'tamagui';
import { DebouncedInput } from '../../shared/debouncedInput'
import { isIpad } from '@/utils';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Settings } from './utils'

interface TopSectionProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<{
    username: string;
    primaryColor: string;
    profilePicture: string | undefined;
    zipCode: string;
    backgroundStyle: "gradient" | `wallpaper-${string}`;
    notificationsEnabled: boolean;
    quoteEnabled: boolean;
    portfolioEnabled: boolean;
    temperatureEnabled: boolean;
    wifiEnabled: boolean;
  }>>;
  pickImage: () => void;
  buildImageSource: (uri?: string) => ImageSourcePropType | undefined;
  setColorPickerOpen: (open: boolean) => void;
}

export function TopSection({ 
  settings, 
  setSettings, 
  pickImage, 
  buildImageSource, 
  setColorPickerOpen 
}: TopSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <XStack gap="$3" flexWrap="wrap" mb={isWeb ? 0 : 10}>
      <YStack width={isWeb ? 100 : isIpad() ? 80 : 60} gap="$2" alignItems="center" justifyContent="center">
        <Circle 
          size={isWeb ? 80 : isIpad() ? 60 : 50} 
          mt={isWeb ? 0 : 7} 
          borderWidth={1} 
          borderColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'} 
          borderStyle="dashed" 
          backgroundColor={isDark ? '#555' : '#f5f5f5'} 
          onPress={pickImage} 
          overflow="hidden"
        >
          {settings.profilePicture ? (
            <Image 
              source={buildImageSource(settings.profilePicture)} 
              style={{ width: 60, height: 60, borderRadius: 30 }} 
            />
          ) : (
            <Text color={isDark ? '#fff' : '#000'} fontSize={11} fontFamily="$body">
              Profile
            </Text>
          )}
        </Circle>
      </YStack>
      <YStack gap="$3" flex={1}>
        <XStack gap="$2" flexWrap="wrap">
          <YStack width={110} gap="$1">
            <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">
              Username
            </Text>
            <DebouncedInput
              size="$3"
              placeholder="Enter username"
              value={settings.username}
              onDebouncedChange={(text) => setSettings((prev) => ({ ...prev, username: text }))}
              backgroundColor={isDark ? '#222' : '#f5f5f5'}
              color={isDark ? '#f3f3f3' : '#000'}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            />
          </YStack>
          <YStack width={90} gap="$1">
            <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">
              Zip Code
            </Text>
            <DebouncedInput
              size="$3"
              placeholder="Enter zip code"
              value={settings.zipCode}
              onDebouncedChange={(text) => setSettings((prev) => ({ ...prev, zipCode: text }))}
              backgroundColor={isDark ? '#222' : '#f5f5f5'}
              color={isDark ? '#f3f3f3' : '#000'}
              borderWidth={1}
              borderColor={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            />
          </YStack>
          
          {!isWeb && !isIpad() && (
          <YStack alignItems="center" gap={2} flex={1}>
            <Text fontSize={13} color={isDark ? '#ccc' : '#000'} fontFamily="$body">Theme</Text>
            <Circle 
              size={30} 
              backgroundColor={settings.primaryColor} 
              pressStyle={{ scale: 0.97 }} 
              onPress={() => setColorPickerOpen(true)} 
            />
          </YStack>
          )}
        </XStack>
      </YStack>
    </XStack>
  );
}
