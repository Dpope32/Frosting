import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, XStack, Text, Button } from 'tamagui'
import { TaskPriority } from '@/types/task'
import { getPriorityColor, withOpacity } from '@/utils/styleUtils'
import { ArrowUp, ArrowRight, ArrowDown } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils/deviceUtils'
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
    <XStack py="$1" px="$2.5" gap="$1.5" alignItems="center" justifyContent="flex-start">
      <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">Priority?</Text>
      <XStack gap="$2" ml="$3">
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
              br={20}
              px="$2.5"
              py="$2.5"
              borderWidth={1}
              borderColor={
                selectedPriority === priority
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray4"
              }
            >
              <Icon
                size={20}
                color={selectedPriority === priority ? color : isDark ? "$gray12" : "$gray11"}
              />
            </Button>
          )
        })}
      </XStack>
    </XStack>
  )
} 