import React from 'react'
import { XStack, YStack, Text, isWeb } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient';

interface HabitEmptyProps {
  isDark: boolean
  primaryColor: string
  isWeb: boolean
}

export const HabitEmpty = ({
  isDark,
  primaryColor,
  isWeb
}: HabitEmptyProps) => {
  return (
    <XStack 
      p={isWeb ? "$6" : "$4"} 
      br="$4" 
      ai="flex-start" 
      jc="center"
      borderWidth={1} 
      borderColor={isDark ? "#333" : "#e0e0e0"} 
      width={isWeb ? "80%" : "90%"} 
      maxWidth={isWeb ? 800 : "100%"} 
      mx="auto" 
      my="$4" 
      overflow="hidden" 
    >
      <LinearGradient
        colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack gap="$4" width="100%" paddingTop={16} position="relative"> 
        <YStack gap="$3" px="$2">
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Build Better Habits
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Define habits you want to track and build consistency.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Track Your Progress
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Mark habits as completed each day and see your progress over time.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                 Stay Motivated
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Visualize your streaks and celebrate your achievements.
              </Text>
            </YStack>
          </XStack>
        </YStack>
        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
          Click the + button below to add your first habit
        </Text>
      </YStack>
    </XStack>
  )
}
