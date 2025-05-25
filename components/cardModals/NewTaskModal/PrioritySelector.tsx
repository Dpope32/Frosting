import React from 'react'
import { useColorScheme } from 'react-native'
import { XStack, Text, Button } from 'tamagui'
import { TaskPriority } from '@/types'
import { getPriorityColor, withOpacity, isIpad } from '@/utils'
import { MaterialIcons } from '@expo/vector-icons'

interface PrioritySelectorProps {
  selectedPriority: TaskPriority
  onPrioritySelect: (priority: TaskPriority, e?: any) => void
}

export function PrioritySelector({ selectedPriority, onPrioritySelect }: PrioritySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const priorityIconNames = {
    high: 'keyboard-arrow-up',
    medium: 'keyboard-arrow-right',
    low: 'keyboard-arrow-down'
  }

  return (
    <XStack px={isIpad() ? "$2.5" : "$2"} my={6} ml={0} gap={isIpad() ? "$1.5" : "$0"} alignItems="center" justifyContent="flex-start">
      <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">Priority:</Text>
      <XStack gap={isIpad() ? "$2" : "$1.5"} ml={isIpad() ? "$2.5" : "$2.5"}>
        {['high', 'medium', 'low'].map(priority => {
          const color = getPriorityColor(priority as TaskPriority)
          const iconName = priorityIconNames[priority as keyof typeof priorityIconNames]
          const buttonSize = isIpad() ? 42 : 32
          return (
            <Button
              key={priority}
              onPress={(e) => onPrioritySelect(priority as TaskPriority, e)}
              backgroundColor={
                selectedPriority === priority
                  ? withOpacity(color, 0.15)
                  : isDark ? "$gray2" : "white"
              }
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              br={buttonSize / 2}
              width={buttonSize}
              height={buttonSize}
              padding={0}
              borderWidth={1}
              borderColor={
                selectedPriority === priority
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray8"
              }
            >
              <MaterialIcons
                name={iconName as any}
                size={isIpad() ? 20 : 14}
                color={selectedPriority === priority ? color : isDark ? "#6c6c6c" : "#9c9c9c"}
              />
            </Button>
          )
        })}
      </XStack>
    </XStack>
  )
} 