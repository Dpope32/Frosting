// @ts-nocheck
import React from 'react'
import { useColorScheme } from 'react-native'
import { XStack, Text, Button } from 'tamagui'
import { TaskPriority } from '@/types'
import { getPriorityColor, withOpacity, isIpad } from '@/utils'
import { ArrowUp, ArrowRight, ArrowDown } from '@tamagui/lucide-icons'

interface PrioritySelectorProps {
  selectedPriority: TaskPriority
  onPrioritySelect: (priority: TaskPriority, e?: any) => void
}

export function PrioritySelector({ selectedPriority, onPrioritySelect }: PrioritySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const priorityIcons = {
    high: ArrowUp,
    medium: ArrowRight,
    low: ArrowDown
  }

  return (
    <XStack px={isIpad() ? "$2.5" : "$2.5"} ml={6} gap={isIpad() ? "$1.5" : "$0"} alignItems="center" justifyContent="flex-start">
      <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">Priority?</Text>
      <XStack gap={isIpad() ? "$2" : "$2"} ml={isIpad() ? "$2.5" : "$2.5"}>
        {['high', 'medium', 'low'].map(priority => {
          const color = getPriorityColor(priority as TaskPriority)
          const Icon = priorityIcons[priority as keyof typeof priorityIcons]
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
              br={isIpad() ? 20 : 20}
              px={isIpad() ? "$2.5" : 12}
              py={isIpad() ? "$2.5" : 12}
              borderWidth={1}
              borderColor={
                selectedPriority === priority
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray8"
              }
            >
              <Icon
                size={isIpad() ? 20 : 16}
                color={selectedPriority === priority ? color : isDark ? "$gray12" : "$gray11"}
              />
            </Button>
          )
        })}
      </XStack>
    </XStack>
  )
} 