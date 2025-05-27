import React from 'react'
import { useColorScheme, Platform, Pressable } from 'react-native'
import { XStack, Text, Button, isWeb } from 'tamagui'
import { TaskPriority } from '@/types'
import { getPriorityColor, withOpacity, isIpad } from '@/utils'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

interface PrioritySelectorProps {
  selectedPriority: TaskPriority
  onPrioritySelect: (priority: TaskPriority, e?: any) => void
  time?: string | null
  onTimePress?: () => void
  isDark?: boolean
}

export function PrioritySelector({ 
  selectedPriority, 
  onPrioritySelect, 
  time, 
  onTimePress,
  isDark: isDarkProp 
}: PrioritySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = isDarkProp ?? colorScheme === 'dark'

  const priorityIconNames = {
    high: 'long-arrow-alt-up',
    medium: 'arrows-alt-h',
    low: 'long-arrow-alt-down'
  }

  return (
    <XStack px={isWeb? "$1.5" : isIpad() ? "$2.5" : "$2"} my={6} ml={0} gap={isIpad() ? "$1.5" : "$0"} alignItems="center" justifyContent="flex-start">
      <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} fontFamily="$body" fontWeight="500">Priority:</Text>
      <XStack gap={isIpad() ? "$2" : "$1.5"} ml={isIpad() ? "$2.5" : "$2.5"}>
        {['high', 'medium', 'low'].map(priority => {
          const color = getPriorityColor(priority as TaskPriority)
          const iconName = priorityIconNames[priority as keyof typeof priorityIconNames]
          
          let currentButtonSize: number;
          let currentIconSize: number;

          if (Platform.OS === 'web') {
            currentButtonSize = 45;
            currentIconSize = 16;
          } else if (isIpad()) {
            currentButtonSize = 42;
            currentIconSize = 16;
          } else {
            currentButtonSize = 32;
            currentIconSize = 12;
          }
          
          const iconColor = selectedPriority === priority ? color : isDark ? "#6c6c6c" : "#9c9c9c";

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
              br={currentButtonSize / 2}
              width={currentButtonSize}
              height={currentButtonSize}
              padding={0}
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor={
                selectedPriority === priority
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray8"
              }
            >
              <FontAwesome5
                name={iconName as any}
                size={currentIconSize}
                color={iconColor}
              />
            </Button>
          )
        })}
      </XStack>
      
      {time && onTimePress && (
        <XStack alignItems="center" gap="$1" ml="$3">
          <Pressable
            onPress={onTimePress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            }}
          >
            <Text
              color={isDark ? '#f1f1f1' : '#333'}
              fontSize={isIpad() ? 15 : 13}
              fontFamily="$body"
              fontWeight="500"
            >
              {time}
            </Text>
            <MaterialIcons 
              name="edit" 
              size={isIpad() ? 16 : 14} 
              color={isDark ? '#888' : '#666'} 
            />
          </Pressable>
        </XStack>
      )}
    </XStack>
  )
} 