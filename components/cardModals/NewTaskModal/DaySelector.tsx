import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView } from 'tamagui'
import { WeekDay } from '@/types'
import { WEEKDAYS } from '@/services/taskService'
import { dayColors, withOpacity } from '@/utils/styleUtils'

interface DaySelectorProps {
  selectedDays: WeekDay[]
  onDayToggle: (day: keyof typeof WEEKDAYS, e?: any) => void
}

export function DaySelector({ selectedDays, onDayToggle }: DaySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <YStack gap="$3">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack gap="$2" py="$1">
          {Object.entries(WEEKDAYS).map(([sd, fd]) => {
            const dayColor = dayColors[sd as keyof typeof dayColors]
            return (
              <Button
                key={sd}
                backgroundColor={
                  selectedDays.includes(fd as WeekDay)
                    ? withOpacity(dayColor, 0.15)
                    : isDark ? "$gray2" : "white"
                }
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                onPress={(e) => onDayToggle(sd as keyof typeof WEEKDAYS, e)}
                br={24}
                px="$2"
                py="$2.5"
                borderWidth={1}
                borderColor={
                  selectedDays.includes(fd as WeekDay)
                    ? 'transparent'
                    : isDark ? "$gray7" : "$gray4"
                }
              >
                <Text
                  fontSize={14}
                  fontWeight="600"
                  fontFamily="$body"
                  color={selectedDays.includes(fd as WeekDay) ? dayColor : isDark ? "$gray12" : "$gray11"}
                >
                  {sd.toUpperCase()}
                </Text>
              </Button>
            )
          })}
        </XStack>
      </ScrollView>
    </YStack>
  )
} 