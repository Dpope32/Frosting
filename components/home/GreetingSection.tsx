import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { Text as RNText } from 'react-native'
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
        {isWeb ? (
          <Text
            fontFamily="$body"
            fontSize={23}
            color={colorScheme === 'dark' ? "#f9f9f9" : "#111"}
            fontWeight="700"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {fullGreeting}
          </Text>
        ) : (
          <RNText
            style={{
              fontFamily: 'System',
              fontSize:   isIpad() ? 21 : 19,
              color: colorScheme === 'dark' ? "#f9f9f9" : "#f1f1f1",
              fontWeight: isWeb ? "600" : "bold",
              }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {fullGreeting}
          </RNText>
        )}
      </XStack>
    </XStack>
  )
}
