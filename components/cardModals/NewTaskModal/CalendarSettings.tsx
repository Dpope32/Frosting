import React from 'react'
import { useColorScheme, Platform, View } from 'react-native'
import { XStack, YStack, Text, Button } from 'tamagui'
import { Switch } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format } from 'date-fns'

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
  showInCalendar,
  onShowInCalendarChange,
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
    <XStack alignItems="center" justifyContent="space-between" px="$2" gap="$3">
      <XStack alignItems="center" gap="$1">
        <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} fontSize={14}>
          Show in Calendar
        </Text>
        <Switch
          value={showInCalendar}
          onValueChange={onShowInCalendarChange}
          style={{ transform: [{ scaleX: 0.8}, { scaleY: 0.8}] }}
        />
      </XStack>

      <YStack flex={1} alignItems='flex-end'>
        <Button
          onPress={onTimePickerToggle}
          theme={isDark ? "dark" : "light"}
          backgroundColor="transparent"
          br={12}
          px="$3"
          pressStyle={{ opacity: 0.8 }}
          jc="flex-start"
          width="100%"
        >
          <XStack flex={1} alignItems="center" justifyContent="space-between">
            <Text fontFamily="$body" color={isDark ? "$gray12" : "$gray11"} fontSize={14}>
              {time || "Select time"}
            </Text>
            <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={14}>
              {showTimePicker ? '▲' : '▼'}
            </Text>
          </XStack>
        </Button>
      </YStack>

      {showTimePicker && (
        <View
          style={{
            zIndex: 10,
            width: '100%',
            backgroundColor: isDark ? '#1c1c1e' : 'white',
            borderRadius: 12,
            elevation: 10,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? '#2c2c2e' : '#e5e5ea',
            marginTop: 8,
          }}
        >
          <YStack
            height={Platform.OS === 'web' ? 100 : 200}
            justifyContent="center"
            alignItems="center"
            padding="$4"
            backgroundColor={isDark ? "$gray1" : "white"}
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
                    padding: 12,
                    fontSize: 16,
                    borderRadius: 8,
                    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                    backgroundColor: isDark ? '#222' : '#fff',
                    color: isDark ? '#fff' : '#000',
                    width: '100%',
                    marginRight: 10
                  }}
                />
                <Button
                  onPress={() => onTimePickerToggle()}
                  backgroundColor={isDark ? "$gray7" : "$gray4"}
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
              />
            )}
          </YStack>
        </View>
      )}
    </XStack>
  )
} 