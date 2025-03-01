import React, { useCallback } from 'react'
import { XStack, Text } from 'tamagui'

interface GreetingSectionProps { username: string }

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours()
    switch (Math.floor(hour / 2)) {
      case 0:
        return "Hello"
      case 1:
        return 'Still up are we'
      case 2:
        return 'Early bird'
      case 3:
        return 'Rise and shine'
      case 4:
        return 'Morning'
      case 5:
        return 'Gm'
      case 6:
        return 'Lunch time'
      case 7:
        return 'Good afternoon'
      case 8:
        return 'Whats good'
      case 9:
        return 'Good evening'
      case 10:
        return 'Gn'
      default:
        return 'Goodnight'
    }
  }, [])

  return (
    <XStack alignItems="center" justifyContent="space-between">
      <XStack alignItems="center" gap="$2" paddingLeft="$3">
        <XStack alignItems="center" gap="$1">
          <Text
            fontFamily="$body"
            fontSize={20}
            color="#dbd0c6"
            fontWeight="bold"
            numberOfLines={1}
            style={{ textShadowColor: 'rgba(0, 0, 0, 0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}
          >
            {getGreeting()},
          </Text>
          <Text
            fontFamily="$body"
            fontSize={20}
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
