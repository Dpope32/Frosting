import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { getGreeting } from '@/services/greetingService'

interface GreetingSectionProps { username: string }

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  
  return (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      br={12}
      py="$2"
    >
      <XStack alignItems="center" gap="$2" paddingLeft={isWeb ? "$4" : "$3"}>
        <XStack alignItems="center" gap="$1">
          <Text
            fontFamily="$heading"
            fontSize={21}
            color="#dbd0c6"
            fontWeight="bold"
            numberOfLines={1}
            style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}
          >
            {getGreeting()},
          </Text>
          <Text
            fontFamily="$heading"
            fontSize={21}
            color="#dbd0c6"
            fontWeight="bold"
            numberOfLines={1}
            style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}
          >
            {' '}{username}
          </Text>
        </XStack>
      </XStack>
    </XStack>
  )
}
