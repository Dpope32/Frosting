import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { XStack, Text, YStack, Button } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Pencil } from '@tamagui/lucide-icons';
import { isIpad } from '@/utils/deviceUtils';

interface TimePickerProps {
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onTimeChange: (event: any, selectedTime?: Date) => void;
  onWebTimeChange: (date: Date) => void;
  time: string | undefined | null;
  isDark: boolean;
  primaryColor: string;
}

export function TimePicker({
  showTimePicker,
  setShowTimePicker,
  selectedDate,
  setSelectedDate,
  onTimeChange,
  onWebTimeChange,
  time,
  isDark,
  primaryColor,
}: TimePickerProps) {
  // Handle time selection completion
  const handleTimeSelected = () => {
    setShowTimePicker(false);
    // We don't call any function to close advanced settings here
  };

  return (
    <YStack flex={1} alignItems='flex-end' paddingHorizontal={isIpad() ? 16 : 0} marginRight={0} mt={0} mb={0}>
      {!showTimePicker && (
      <Pressable
        onPress={() => setShowTimePicker(!showTimePicker)}
        style={{
          width: '100%',
          height: 48,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: isIpad() ? 16 : 12,
          justifyContent: 'space-between',
          backgroundColor: time ? 'transparent' : (isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'),
          shadowOpacity: 0,
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        <Text
          fontFamily="$body"
          color={time ? (isDark ? '#f3f3f3' : '#333') : (isDark ? "#7c7c7c" : "#9c9c9c")}
          fontSize={isIpad() ? 17 : 16}
          style={{ flex: 1 }}
          fontWeight="500"
        >
          {time || "Select time"}
        </Text>
        {time ? (
          <Pencil size={18} color={isDark ? '#555' : '#f3f3f3'} />
        ) : (
          <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={14}>
            {showTimePicker ? '▲' : '▼'}
          </Text>
        )}
      </Pressable>
      )}

      {showTimePicker && (
        <View
          style={{
            zIndex: 999,
            width: '100%',
            backgroundColor: isDark ? '#141415' : 'white',
            borderRadius: 12,
            elevation: 5,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            overflow: 'visible',
            position: 'relative',
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          <YStack
            height={Platform.OS === 'web' ? 130 : 220}
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={isDark ? "#141415" : "white"}
            borderRadius={12}
            padding={0}
            paddingBottom={0}
          >
            {Platform.OS === 'web' ? (
              <YStack width="100%" gap="$2" pt={10} pb={6}>
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
                    width: '100%'
                  }}
                />
                <XStack width="100%" justifyContent="space-between" gap="$4" mt="$1">
                  <Button
                    onPress={() => setShowTimePicker(false)}
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
                    onPress={handleTimeSelected}
                    backgroundColor={primaryColor}
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
            ) : (
              <YStack width="100%" alignItems="center" gap="$1" pt={6} pb={6}>
                <DateTimePicker
                  value={new Date(selectedDate)} 
                  style={{ width: '100%', height: 150}}
                  mode="time"
                  is24Hour={false}
                  onChange={onTimeChange}
                  display="spinner"
                  themeVariant={isDark ? "dark" : "light"}
                />
                <XStack width="100%" justifyContent="space-between" gap="$4" px="$2">
                  <Button
                    onPress={() => setShowTimePicker(false)}
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
                    onPress={handleTimeSelected}
                    backgroundColor={primaryColor}
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
          </YStack>
        </View>
      )}
    </YStack>
  );
}
