import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { getGreeting } from '@/services'
import { useColorScheme } from 'react-native'
import { useWeatherStore } from '@/store'
import { isIpad } from '@/utils'

interface GreetingSectionProps { username: string }

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  const colorScheme = useColorScheme()
  const currentTemp = useWeatherStore(s => s.currentTemp)
  const fullGreeting = getGreeting(username, currentTemp ?? undefined)

  return (
    <XStack 
      alignItems={isIpad() ? "flex-start" : "center"} 
      justifyContent={isIpad() ? "center" : "flex-start"} 
      br={16}
      pl={isWeb ? "$2" : "$0"}
      ml={isIpad() ? -40 : 0}
      py={isWeb ? "$2" : isIpad() ? "$2" : "$1"}
    >

      <XStack alignItems="center" paddingRight={isWeb ? "$7" : isIpad() ? "$0" : "$0"} justifyContent="center"> 
        <Text
          fontFamily="$heading"
          fontSize={isWeb ? 23 : isIpad() ? 20 : 18}
          color={colorScheme === 'dark' ? "#dbd0c6" : "#dbd0c6"}
          fontWeight="bold"
        >
          {fullGreeting}
        </Text>
      </XStack>
    </XStack>
  )
}
