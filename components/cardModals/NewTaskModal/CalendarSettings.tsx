import React from 'react'
import { useColorScheme, Platform, View } from 'react-native'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { Switch } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'
import { isIpad } from '@/utils/deviceUtils'
import { Pencil, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'

interface CalendarSettingsProps {
  showInCalendar: boolean
  onShowInCalendarChange: (value: boolean) => void
  time: string
  showTimePicker: boolean
  onTimePickerToggle: () => void
  selectedDate: Date
  onTimeChange: (event: any, pickedDate?: Date) => void
  onWebTimeChange: (date: Date) => void
}

export function CalendarSettings({
  time,
  showTimePicker,
  onTimePickerToggle,
  selectedDate,
  onTimeChange,
  onWebTimeChange
}: CalendarSettingsProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <XStack alignItems="center" gap="$3">
      <Button
        onPress={onTimePickerToggle}
        theme={isDark ? "dark" : "light"}
        backgroundColor={time ? "transparent" : "transparent"}
        br={12}
        px={"$3"}
        py={isWeb ? "$4" : isIpad() ? "$2" : "$1"}
        pressStyle={{ opacity: 0.8 }}
        width="auto"
        alignSelf="flex-start"
      >
        <XStack alignItems="center" justifyContent="center" gap="$2">
          <Text fontFamily="$body" color={isDark ? time ? "#ffffff" : "#6c6c6c" : time ? "#6c6c6c" : "$gray11"} fontSize={time? isIpad() ? 18 : 16 : isIpad() ? 16 : 14}>
            {time ? time : "Select Time"}
          </Text>
          {showTimePicker ? (
            <ChevronUp size={isIpad() ? 20 : 16} color={isDark ? "#fff" : "#6c6c6c"} />
          ) : (
            <ChevronDown size={isIpad() ? 20 : 16} color={isDark ? "#fff" : "#6c6c6c"} />
          )}
        </XStack>
      </Button>
      {showTimePicker && (
        <View
          style={{
            zIndex: 100,
            width: isWeb ? 260 : isIpad() ? 220 : 140,
            maxWidth: isWeb ? 260 : isIpad() ? 220 : 190,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#2c2c2e' : '#e5e5ea',
          }}
        >
          <YStack
            height={Platform.OS === 'web' ? 60 : 75}
            justifyContent="center"
            alignItems="center"
            w={isIpad() ? 220 : 150}
            padding={isWeb ? 16 : isIpad() ? 0 : "$2"}
            borderRadius={12}
          >
            {Platform.OS === 'web' ? (
              <XStack width="100%" alignItems="center" justifyContent="space-between">
                <input
                  type="time"
                  value={format(selectedDate, 'HH:mm')}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onChange={e => {
                    const [hrs, mins] = e.target.value.split(':').map(Number)
                    const newDate = new Date(selectedDate)
                    newDate.setHours(hrs)
                    newDate.setMinutes(mins)
                    onWebTimeChange(newDate)
                  }}
                  style={{
                    padding: 8,
                    fontSize: 18,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#222' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    width: '100%',
                    marginRight: 0,
                    border: 'none',
                    outline: 'none',
                  }}
                />
                <Button
                  onPress={() => onTimePickerToggle()}
                  backgroundColor={isDark ? "transparent" : "transparent"}
                  px="$3"
                  py="$2"
                  br={12}
                >
                  <Text color="white" fontFamily="$body" fontWeight="600">Done</Text>
                </Button>
              </XStack>
            ) : (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                is24Hour={false}
                onChange={onTimeChange}
                display="spinner"
                themeVariant={isDark ? "dark" : "light"}
                style={{
                  height: isIpad() ? 200 : 100,
                  width: isIpad() ? 230 : 132,
                  minWidth: 0,
                  maxWidth: 320,
                  backgroundColor: isDark ? "#111" : "#fff",
                }}
              />
            )}
          </YStack>
        </View>
      )}
    </XStack>
  )
} 