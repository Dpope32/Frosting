import React from 'react'
import { Pressable } from 'react-native'
import { Stack, YStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import { isIpad } from '@/utils/deviceUtils'

interface SettingsCardProps {
  isHome?: boolean
  isDark?: boolean
  onPress?: () => void
}

export function SettingsCard({ isHome, isDark, onPress }: SettingsCardProps) {
  return (
    <Stack
      minWidth={70}
      height={60}    
      br={16}
      backgroundColor={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.3)"}
      borderWidth={1}
      borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
    >
      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          }
          onPress && onPress();
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        <YStack gap="$1" alignItems="center">
          <Ionicons
            name="settings-outline"
            size={24}
            color="#dbd0c6"
            style={{
              textShadowColor: 'rgba(219, 208, 198, 0.15)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 4
            }}
          />
        </YStack>
      </Pressable>
    </Stack>
  )
} 