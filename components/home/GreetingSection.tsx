import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { getGreeting } from '@/services/greetingService'
import { useColorScheme } from 'react-native'
import { useWeatherStore } from '@/store/WeatherStore'

interface GreetingSectionProps { username: string }

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  const colorScheme = useColorScheme()
  const currentTemp = useWeatherStore(s => s.currentTemp)
  // Get the full, personalized greeting string, passing temperature if available
  const fullGreeting = getGreeting(username, currentTemp ?? undefined)

  return (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      br={16}
      px="$3"
      py="$2"
    >
      <XStack alignItems="center" gap="$2" paddingLeft={isWeb ? "$1" : "$0"}>
        <Text
          fontFamily="$heading"
          fontSize={21}
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
