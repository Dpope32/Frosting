import React, { useState } from 'react'
import { useColorScheme, Platform, View } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView } from 'tamagui'
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MONTHS } from '@/services/taskService'

interface DateSelectorProps {
  isYearly: boolean
  recurrenceDate: string | null | undefined
  onDateSelect: (date: string) => void
  preferences: any
  onDatePickerVisibilityChange?: (visible: boolean) => void
}

export function DateSelector({ 
  isYearly, 
  recurrenceDate, 
  onDateSelect, 
  preferences,
  onDatePickerVisibilityChange 
}: DateSelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const isWeb = Platform.OS === 'web'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthDaySelector, setShowMonthDaySelector] = useState(false);
  
  // Notify parent when any picker is visible
  React.useEffect(() => {
    onDatePickerVisibilityChange?.(showDatePicker || showMonthDaySelector);
  }, [showDatePicker, showMonthDaySelector, onDatePickerVisibilityChange]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === 'ios'); // Hide picker on Android after selection
    
    // For monthly recurrence, preserve the current year
    if (!isYearly) {
      const currentYear = new Date().getFullYear();
      currentDate.setFullYear(currentYear);
    }
    
    onDateSelect(currentDate.toISOString().split('T')[0]);
  };

  const currentDate = recurrenceDate ? new Date(recurrenceDate) : new Date();
  
  // Format the display date based on recurrence type
  const displayDate = recurrenceDate 
    ? isYearly 
      ? format(currentDate, 'MMM d, yyyy')
      : format(currentDate, 'MMM d')
    : isYearly ? 'Select Date' : 'Select Day';

  // Function to handle day selection for monthly recurrence
  const handleDaySelect = (day: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    
    // Preserve current year for monthly
    if (!isYearly) {
      const currentYear = new Date().getFullYear();
      newDate.setFullYear(currentYear);
    }
    
    onDateSelect(newDate.toISOString().split('T')[0]);
    setShowMonthDaySelector(false);
  };

  // Function to handle month selection for monthly recurrence
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    
    // Preserve current year for monthly
    if (!isYearly) {
      const currentYear = new Date().getFullYear();
      newDate.setFullYear(currentYear);
    }
    
    onDateSelect(newDate.toISOString().split('T')[0]);
  };

  return (
    <YStack gap="$3" ml={6}>
      <YStack>
        <Button
          onPress={() => {
            if (isYearly) {
              setShowDatePicker(true);
            } else {
              setShowMonthDaySelector(!showMonthDaySelector);
            }
          }}
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
        
        {/* Yearly: Full date picker */}
        {isYearly && showDatePicker && (
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            {isWeb ? (
              <input
                type="date"
                value={format(currentDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  onDateSelect(newDate.toISOString().split('T')[0]);
                  setShowDatePicker(false);
                }}
                style={{
                  padding: 12,
                  fontSize: 16,
                  borderRadius: 8,
                  border: `1px solid ${isDark ? '#444' : '#ddd'}`,
                  backgroundColor: isDark ? '#222' : '#fff',
                  color: isDark ? '#fff' : '#000',
                  width: '100%'
                }}
              />
            ) : (
              <YStack alignItems="center">
                <DateTimePicker
                  value={currentDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  themeVariant={isDark ? "dark" : "light"}
                />
                <XStack width="100%" justifyContent="space-between" gap="$4" px="$2" mt="$2">
                  <Button
                    onPress={() => setShowDatePicker(false)}
                    backgroundColor={isDark ? "$gray3" : "transparent"}
                    px="$2"
                    py="$1"
                    height={32}
                    br={12}
                    flex={1}
                    borderWidth={1}
                    borderColor={isDark ? "transparent" : "$gray4"}
                  >
                    <Text color={isDark ? "$gray11" : "$gray11"} fontFamily="$body" fontWeight="500">Cancel</Text>
                  </Button>
                  <Button
                    onPress={() => setShowDatePicker(false)}
                    backgroundColor={preferences.primaryColor}
                    px="$2"
                    py="$1"
                    height={32}
                    br={24}
                    flex={1}
                  >
                    <Text color="white" fontFamily="$body" fontWeight="500">Done</Text>
                  </Button>
                </XStack>
              </YStack>
            )}
          </View>
        )}
        
        {/* Monthly: Month and day selector */}
        {!isYearly && showMonthDaySelector && (
          <YStack gap="$2" mt="$2">
            {/* Month selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" py="$1">
                {MONTHS.map((month, index) => (
                  <Button
                    key={month}
                    backgroundColor={
                      currentDate.getMonth() === index
                        ? preferences.primaryColor
                        : isDark ? "$gray2" : "white"
                    }
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    onPress={() => handleMonthSelect(index)}
                    br={24}
                    px="$2"
                    py="$1.5"
                    height={32}
                    borderWidth={1}
                    borderColor={
                      currentDate.getMonth() === index
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
                        currentDate.getMonth() === index
                          ? '#fff'
                          : isDark ? "$gray12" : "$gray11"
                      }
                    >
                      {month.substring(0, 3)}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </ScrollView>
            
            {/* Day selector */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" py="$1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <Button
                    key={day}
                    backgroundColor={
                      currentDate.getDate() === day
                        ? preferences.primaryColor
                        : isDark ? "$gray2" : "white"
                    }
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    onPress={() => handleDaySelect(day)}
                    br={24}
                    px="$2"
                    py="$1.5"
                    height={32}
                    borderWidth={1}
                    borderColor={
                      currentDate.getDate() === day
                        ? 'transparent'
                        : isDark ? "$gray7" : "$gray4"
                    }
                    minWidth={38}
                  >
                    <Text
                      fontSize={14}
                      fontWeight="600"
                      fontFamily="$body"
                      color={
                        currentDate.getDate() === day
                          ? '#fff'
                          : isDark ? "$gray12" : "$gray11"
                      }
                    >
                      {day}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </ScrollView>
            
            {/* Done button */}
            <Button
              onPress={() => setShowMonthDaySelector(false)}
              backgroundColor={preferences.primaryColor}
              mt="$2"
              py="$1"
              height={32}
              br={24}
              alignSelf="flex-end"
              width={100}
            >
              <Text color="white" fontFamily="$body" fontWeight="500">Done</Text>
            </Button>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
