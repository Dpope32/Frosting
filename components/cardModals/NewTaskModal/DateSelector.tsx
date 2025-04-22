import React from 'react'
import { useColorScheme, Platform } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView } from 'tamagui'
import { MONTHS } from '@/services/taskService'

interface DateSelectorProps {
  isYearly: boolean
  recurrenceDate: string
  onDateSelect: (date: string) => void
  preferences: any
}

export function DateSelector({ isYearly, recurrenceDate, onDateSelect, preferences }: DateSelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'

  return (
    <YStack gap="$3">
      {isYearly && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" py="$1">
            {MONTHS.map((m, i) => (
              <Button
                key={m}
                backgroundColor={
                  new Date(recurrenceDate || new Date().toISOString()).getMonth() === i
                    ? preferences.primaryColor
                    : isDark ? "$gray2" : "white"
                }
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                onPress={() => {
                  const d = new Date(recurrenceDate || new Date().toISOString())
                  d.setMonth(i)
                  onDateSelect(d.toISOString().split('T')[0])
                }}
                br={24}
                px="$2"
                py="$2.5"
                borderWidth={1}
                borderColor={
                  new Date(recurrenceDate || new Date().toISOString()).getMonth() === i
                    ? 'transparent'
                    : isDark ? "$gray7" : "$gray4"
                }
                minWidth={45}
              >
                <Text
                  fontSize={14}
                  fontWeight="600"
                  fontFamily="$body"
                  color={
                    new Date(recurrenceDate || new Date().toISOString()).getMonth() === i
                      ? '#fff'
                      : isDark ? "$gray12" : "$gray11"
                  }
                >
                  {m.substring(0, 3)}
                </Text>
              </Button>
            ))}
          </XStack>
        </ScrollView>
      )}
      <ScrollView
        horizontal={!isWeb}
        showsHorizontalScrollIndicator={false}
      >
        <XStack
          gap="$2"
          py="$1"
          flexWrap={isWeb ? 'wrap' : 'nowrap'}
        >
          {Array.from({ length: 31 }, (_, idx) => idx + 1).map(d => (
            <Button
              key={d}
              backgroundColor={
                new Date(recurrenceDate || new Date().toISOString()).getDate() === d
                  ? preferences.primaryColor
                  : isDark ? "$gray2" : "white"
              }
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={() => {
                const dt = new Date(recurrenceDate || new Date().toISOString())
                dt.setDate(d)
                onDateSelect(dt.toISOString().split('T')[0])
              }}
              br={24}
              px="$2"
              py="$2.5"
              borderWidth={1}
              borderColor={
                new Date(recurrenceDate || new Date().toISOString()).getDate() === d
                  ? 'transparent'
                  : isDark ? "$gray7" : "$gray4"
              }
              minWidth={45}
              mb={isWeb ? '$2' : '$0'}
            >
              <Text
                fontSize={14}
                fontWeight="600"
                fontFamily="$body"
                color={
                  new Date(recurrenceDate || new Date().toISOString()).getDate() === d
                    ? '#fff'
                    : isDark ? "$gray12" : "$gray11"
                }
              >
                {d}
              </Text>
            </Button>
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  )
} 