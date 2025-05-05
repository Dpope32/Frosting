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
  onTimeChange: (event: any, pickedDate?: Date) => void;
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
    <YStack flex={1} alignItems='flex-end'>
      <Pressable
        onPress={() => setShowTimePicker(!showTimePicker)}
        style={{
          width: '100%',
          height: 50,
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          backgroundColor: time ? 'transparent' : (isDark ? 'transparent' : 'rgba(238,238,238,0.4)'),
          shadowOpacity: 0,
          marginTop: 0,
          marginBottom: 0,
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

      {showTimePicker && (
        <View
          style={{
            zIndex: 10,
            width: '100%',
            backgroundColor: isDark ? 'transparent' : 'white',
            borderRadius: 12,
            elevation: 5,
            marginTop: -10,
            shadowColor: 'black',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
        >
          <YStack
            height={Platform.OS === 'web' ? 100 : 200}
            justifyContent="center"
            alignItems="center"
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
                  onPress={() => setShowTimePicker(false)}
                  backgroundColor={primaryColor}
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
                style={{ width: '100%' , height: 200}}
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
    </YStack>
  );
}
