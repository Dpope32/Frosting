import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { getGreeting } from '@/services'
import { useColorScheme } from 'react-native'
import { useWeatherStore } from '@/store'
import { useProjectStore } from '@/store/ProjectStore'
import { useHabitStore } from '@/store/HabitStore'
import { isIpad } from '@/utils'
import { Platform } from 'react-native'

interface GreetingSectionProps { username: string }

export const GreetingSection = ({ username }: GreetingSectionProps) => {
  const colorScheme = useColorScheme()
  const currentTemp = useWeatherStore(s => s.currentTemp)
  const showUsername = Platform.OS === 'web' || isIpad();
  const projectCount = useProjectStore(s => s.projects.length)
  const habitCount = useHabitStore(s => Object.keys(s.habits).length)
  const fullGreeting = getGreeting(username, currentTemp ?? undefined, showUsername, projectCount, habitCount)

  return (
    <XStack 
      alignItems={isIpad() ? "flex-start" : "center"} 
      justifyContent={isIpad() ? "center" : "flex-start"} 
      br={16}
      pl={isWeb ? "$2" : "$0"}
      ml={isIpad() ? -40 : 0}
      py={isWeb ? "$2" : isIpad() ? "$2" : "$1"}
      maxWidth={isWeb ? 600 : isIpad() ? 500 : 320}
    >
      <XStack alignItems="center" paddingRight={isWeb ? "$7" : "$0"} justifyContent="center"> 
        <Text
          fontFamily="$heading"
          fontSize={isWeb ? 23 : isIpad() ? 20 : 17}
          color={colorScheme === 'dark' ? "#dbd0c6" : "#dbd0c6"}
          fontWeight="bold"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {fullGreeting}
        </Text>
      </XStack>
    </XStack>
  )
}
