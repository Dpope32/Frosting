import React, { useState } from 'react'
import { useColorScheme, Platform } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView } from 'tamagui'
import { MONTHS } from '@/services/taskService'
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface DateSelectorProps {
  isYearly: boolean
  recurrenceDate: string | null | undefined
  onDateSelect: (date: string) => void
  preferences: any
}

export function DateSelector({ isYearly, recurrenceDate, onDateSelect, preferences }: DateSelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios'); // Hide picker on Android after selection
    onDateSelect(currentDate.toISOString().split('T')[0]);
  };

  const currentDate = recurrenceDate ? new Date(recurrenceDate) : new Date();
  const displayDate = recurrenceDate ? format(currentDate, 'yyyy-MM-dd') : 'Select Date';

  return (
    <YStack gap="$3">
      {isYearly ? (
        <YStack>
          <Button
            onPress={() => setShowDatePicker(true)}
            backgroundColor={
              recurrenceDate
                ? preferences.primaryColor
                : isDark ? "$gray2" : "white"
            }
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={24}
            px="$2"
            py="$2.5"
            borderWidth={1}
            borderColor={
              recurrenceDate
                ? 'transparent'
                : isDark ? "$gray7" : "$gray4"
            }
            minWidth={120}
            alignSelf="flex-start"
          >
            <Text
              fontSize={14}
              fontWeight="600"
              fontFamily="$body"
              color={
                recurrenceDate
                  ? '#fff'
                  : isDark ? "$gray12" : "$gray11"
              }
            >
              {displayDate}
            </Text>
          </Button>
          {showDatePicker && (
            <DateTimePicker
              value={currentDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}
        </YStack>
      ) : (
        <>
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
        </>
      )}
    </YStack>
  )
}
