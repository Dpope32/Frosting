import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { getGreeting } from '@/services/greetingService'
import { useColorScheme, Platform } from 'react-native'
import { useWeatherStore } from '@/store/WeatherStore'
import { isIpad } from '@/utils/deviceUtils'
import { Ionicons } from '@expo/vector-icons'
import { Pressable } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'

interface GreetingSectionProps { 
  username: string
}

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  const colorScheme = useColorScheme()
  const currentTemp = useWeatherStore(s => s.currentTemp)
  const fullGreeting = getGreeting(username, currentTemp ?? undefined)
  const router = useRouter()

  return (
    <XStack 
      alignItems={isIpad() ? "flex-start" : "center"} 
      justifyContent={isIpad() ? "center" : "flex-start"}
      br={16}
      pl={isWeb ? "$2" : "$2"}
      py={isWeb ? "$2" : isIpad() ? "$2" : "$1"}
      width="100%"
    >
      <XStack alignItems="center" gap="$2" paddingRight={isWeb ? "$6" : "$0"} flex={isIpad() ? 2 : undefined} justifyContent="center">
        <Text
          fontFamily="$heading"
          fontSize={isWeb ? 21 : isIpad() ? 23 : 19}
          color={colorScheme === 'dark' ? "#dbd0c6" : "#dbd0c6"}
          fontWeight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}
        >
          {fullGreeting}
        </Text>
      </XStack>
    </XStack>
  )
}
