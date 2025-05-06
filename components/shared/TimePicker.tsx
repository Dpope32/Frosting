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
  return (
    <YStack flex={1} alignItems='flex-end' paddingHorizontal={isIpad() ? 16 : 2} mr={6}>
      {!showTimePicker && (
      <Pressable
        onPress={() => setShowTimePicker(!showTimePicker)}
        style={{
          width: '98%',
          height: 45,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: isIpad() ? 16 : 16,
          justifyContent: 'space-between',
          backgroundColor: time ? 'transparent' : (isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)'),
          shadowOpacity: 0,
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        <Text
          fontFamily="$body"
          color={time ? (isDark ? '#f3f3f3' : '#333') : (isDark ? "#777" : "#999")}
          fontSize={isIpad() ? 17 : 15}
          style={{ flex: 1 }}
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
          }}
        >
          <YStack
            height={Platform.OS === 'web' ? 150 : 280}
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={isDark ? "#141415" : "white"}
            borderRadius={12}
            padding="$2"
            paddingBottom="$4"
          >
            {Platform.OS === 'web' ? (
              <YStack width="100%" gap="$3">
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
                <XStack width="100%" justifyContent="space-between" gap="$2">
                  <Button
                    onPress={() => setShowTimePicker(false)}
                    backgroundColor={isDark ? "$gray3" : "$gray3"}
                    px="$2.5"
                    py="$2"
                    br={12}
                    flex={1}
                    width={isIpad() ? 100 : 60}
                  >
                    <Text color={isDark ? "$gray11" : "$gray11"} fontFamily="$body" fontWeight="500">Cancel</Text>
                  </Button>
                  <Button
                    onPress={() => setShowTimePicker(false)}
                    backgroundColor={primaryColor}
                    px="$2.5"
                    py="$1.5"
                    br={24}
                    flex={1}
                    width={isIpad() ? 100 : 60}
                  >
                    <Text color="white" fontFamily="$body" fontWeight="500">Done</Text>
                  </Button>
                </XStack>
              </YStack>
            ) : (
              <YStack width="100%" alignItems="center" gap="$3">
                <DateTimePicker
                  value={new Date(selectedDate)} 
                  style={{ width: '100%' , height: 200}}
                  mode="time"
                  is24Hour={false}
                  onChange={onTimeChange}
                  display="spinner"
                  themeVariant={isDark ? "dark" : "light"}
                />
                <XStack width="100%" justifyContent="space-between" gap="$2" px="$2">
                  <Button
                    onPress={() => setShowTimePicker(false)}
                    backgroundColor={isDark ? "$gray3" : "$gray3"}
                    px="$4"
                    py="$2"
                    br={12}
                    flex={1}
                  >
                    <Text color={isDark ? "$gray11" : "$gray11"} fontFamily="$body" fontWeight="600">Cancel</Text>
                  </Button>
                  <Button
                    onPress={() => {
                      setShowTimePicker(false);
                    }}
                    backgroundColor={primaryColor}
                    px="$4"
                    py="$2"
                    br={12}
                    flex={1}
                  >
                    <Text color="white" fontFamily="$body" fontWeight="600">Done</Text>
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
