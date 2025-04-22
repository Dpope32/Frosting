import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, XStack, Text, Button } from 'tamagui'
import { TaskPriority } from '@/types/task'
import { getPriorityColor, withOpacity } from '@/utils/styleUtils'

interface PrioritySelectorProps {
  selectedPriority: TaskPriority
  onPrioritySelect: (priority: TaskPriority, e?: any) => void
}

export function PrioritySelector({ selectedPriority, onPrioritySelect }: PrioritySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <YStack px="$2" gap="$1">
      <Text color={isDark ? "$gray9" : "$gray11"} fontFamily="$body" fontWeight="500">Priority</Text>
      <XStack gap="$2" mt="$1">
        {['high', 'medium', 'low'].map(priority => {
          const color = getPriorityColor(priority as TaskPriority)
          
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
              br={20}
              px="$3"
              py="$2.5"
              borderWidth={1}
              borderColor={
                selectedPriority === priority
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray4"
              }
            >
              <Text
                fontSize={14}
                fontFamily="$body"
                fontWeight={selectedPriority === priority ? "700" : "600"}
                color={selectedPriority === priority ? color : isDark ? "$gray12" : "$gray11"}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Text>
            </Button>
          )
        })}
      </XStack>
    </YStack>
  )
} 