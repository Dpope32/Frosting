import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { getGreeting } from '@/services/greetingService'
import { useColorScheme } from 'react-native'

interface GreetingSectionProps { username: string }

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  const colorScheme = useColorScheme()
  // Get the full, personalized greeting string
  const fullGreeting = getGreeting(username)

  return (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      br={16}
      px="$3"
      py="$1"
      pb="$3"
    >
      <XStack alignItems="center" gap="$2" paddingLeft={isWeb ? "$1" : "$1"}>
        <Text
          fontFamily="$heading"
          fontSize={21}
          color={colorScheme === 'dark' ? "#dbd0c6" : "#F5F5F5"}
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
