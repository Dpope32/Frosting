import React from 'react'
import { Pressable } from 'react-native'
import { Stack, YStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'
import { isIpad } from '@/utils'
import { isWeb } from 'tamagui'

interface SettingsCardProps {
  isHome?: boolean
  isDark?: boolean
  onPress?: () => void
}

export function SettingsCard({ isHome, isDark, onPress }: SettingsCardProps) {
  let bg: string;
  if (isWeb) {
    bg = "rgba(0, 0, 0, 0.0)";
  } else if (isIpad()) {
    bg = "rgba(0, 0, 0, 0.3)";
  } else {
    bg = "rgba(0, 0, 0, 0.0)";
  }

  return (
    <Stack
      minWidth={70}
      height={60}    
      br={16}
      backgroundColor={bg}
      borderWidth={2}
      borderColor={isWeb ? "transparent" : isDark ? "rgba(255, 255, 255, 0.175)" : "rgba(200, 200, 200, 0.3)"}
      hoverStyle={{ 
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        transform: [{ scale: 1.02 }],
        shadowColor: "#dbd0c6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
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
          />
        </YStack>
      </Pressable>
    </Stack>
  )
} 