import React from 'react'
import { useColorScheme } from 'react-native'
import {  XStack, Text, Button, ScrollView } from 'tamagui'
import { RecurrencePattern } from '@/types'
import { RECURRENCE_PATTERNS } from '@/services'
import { getRecurrenceColor, withOpacity, isIpad } from '@/utils'

interface RecurrenceSelectorProps {
  selectedPattern: RecurrencePattern
  onPatternSelect: (pattern: RecurrencePattern, e?: any) => void
}

export function RecurrenceSelector({ selectedPattern, onPatternSelect }: RecurrenceSelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
      <XStack pl="$2" gap="$2.5" alignItems="center">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" py="$1">
          {RECURRENCE_PATTERNS.map(pattern => {
            const recurrenceColor = getRecurrenceColor(pattern.value)
            
            return (
              <Button
                key={pattern.value}
                backgroundColor={
                  selectedPattern === pattern.value
                    ? withOpacity(recurrenceColor, 0.15)
                    : isDark ? "$gray2" : "white"
                }
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                onPress={(e) => onPatternSelect(pattern.value, e)}
                br={20}
                px="$3"
                py="$2.5"
                borderWidth={1}
                borderColor={
                  selectedPattern === pattern.value
                    ? 'transparent'
                    : isDark ? "$gray7" : "$gray8"
                }
              >
                <XStack alignItems="center" gap="$1.5">
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    fontFamily="$body"
                    color={
                      selectedPattern === pattern.value
                        ? recurrenceColor
                        : isDark
                          ? "$gray11"
                          : "$gray11"
                    }
                  >
                    {pattern.label}
                  </Text>
                </XStack>
              </Button>
            )
          })}
        </XStack>
      </ScrollView>
    </XStack>
  )
} 