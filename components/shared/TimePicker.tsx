import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { XStack, Text, YStack, Button, isWeb } from 'tamagui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { isIpad } from '@/utils';

interface TimePickerProps {
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  selectedDate: Date;
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
  onTimeChange,
  onWebTimeChange,
  time,
  isDark,
  primaryColor,
}: TimePickerProps) {

  const handleTimeSelected = () => {
    setShowTimePicker(false);
  };

  return (
    <YStack flex={1} alignItems='center' paddingHorizontal={isWeb ? 5 : isIpad() ? 10 : 0} marginRight={0} mt={isIpad() ? 8 : 4} mb={4}>
      {!showTimePicker && (
      <XStack
        width="102%"
        alignItems="center"
        justifyContent="flex-start"
        my={6}
        ml={0}
        gap={isIpad() ? "$1.5" : "$0"}
      >
        <Text 
          color={isDark ? '#6c6c6c' : '#9c9c9c'} 
          fontSize={isIpad() ? 17 : 15} 
          fontFamily="$body" 
          fontWeight="500"
        >
          Time:
        </Text>
        
        <Pressable
          onPress={() => setShowTimePicker(!showTimePicker)}
          style={{
            height: 35,
            borderRadius: 12,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: isIpad() ? 14 : 12,
            paddingBottom: 5,
            justifyContent: 'space-between',
            backgroundColor: time ? (isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)') : 'transparent',
            marginLeft: isIpad() ? 12 : 10,
          }}
        >
          <Text
            fontFamily="$body"
            color={isDark ? '#9a9a9a' : '#7c7c7c'}
            fontSize={isWeb ? 17 : isIpad() ? 15 : 14}
            fontWeight="500"
          >
            {time || "Select time"}
          </Text>
          {time ? (
            <MaterialIcons name="timer" size={18} color={isDark ? '#5c5c5c' : '#aaa'} style={{ marginLeft: 4 }} />
          ) : (
            <Text fontFamily="$body" color={isDark ? "$gray11" : "$gray10"} fontSize={14}>
              {showTimePicker ? '▲' : '▼'}
            </Text>
          )}
        </Pressable>
      </XStack>
      )}

      {showTimePicker && (
        <View
          style={{
            zIndex: 999,
            width: '100%',
            backgroundColor: isDark ? '#191919' : 'white',
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
            backgroundColor={isDark ? "transparent" : "white"}
            borderRadius={12}
            padding={0}
            paddingBottom={0}
          >
            {Platform.OS === 'web' ? (
              <YStack width="50%" backgroundColor={isDark ? "transparent" : "transparent"} gap="$1" pt={10} pb={6}>
                <XStack width="100%"  justifyContent="center" alignItems="center" gap="$0">
                  <YStack alignItems="center" flex={1}>
                    <Text color={isDark ? '$gray11' : '$gray9'} fontSize={12} fontFamily="$body" mb="$1">
                      Hour
                    </Text>
                    <Pressable
                      style={{
                        backgroundColor: isDark ? '#222' : '#f8f8f8',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDark ? '#444' : '#ddd',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        minWidth: 60,
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        const currentHour = selectedDate.getHours();
                        const newHour = currentHour === 23 ? 0 : currentHour + 1;
                        const newDate = new Date(selectedDate);
                        newDate.setHours(newHour);
                        onWebTimeChange(newDate);
                      }}
                    >
                      <Text color={isDark ? '#fff' : '#000'} fontSize={18} fontFamily="$body" fontWeight="600">
                        {format(selectedDate, 'hh')}
                      </Text>
                    </Pressable>
                  </YStack>
                  
                  <Text color={isDark ? '#fff' : '#000'} fontSize={24} fontFamily="$body" fontWeight="300" mt="$4">
                    :
                  </Text>
                  
                  <YStack alignItems="center" flex={1}>
                    <Text color={isDark ? '$gray11' : '$gray9'} fontSize={12} fontFamily="$body" mb="$1">
                      Minute
                    </Text>
                    <Pressable
                      style={{
                        backgroundColor: isDark ? '#222' : '#f8f8f8',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDark ? '#444' : '#ddd',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        minWidth: 60,
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        const currentMinute = selectedDate.getMinutes();
                        const newMinute = currentMinute >= 55 ? 0 : currentMinute + 5;
                        const newDate = new Date(selectedDate);
                        newDate.setMinutes(newMinute);
                        onWebTimeChange(newDate);
                      }}
                    >
                      <Text color={isDark ? '#fff' : '#000'} fontSize={18} fontFamily="$body" fontWeight="600">
                        {format(selectedDate, 'mm')}
                      </Text>
                    </Pressable>
                  </YStack>
                  
                  <YStack alignItems="center" flex={1}>
                    <Text color={isDark ? '$gray11' : '$gray9'} fontSize={12} fontFamily="$body" mb="$1">
                      AM/PM
                    </Text>
                    <Pressable
                      style={{
                        backgroundColor: isDark ? '#222' : '#f8f8f8',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDark ? '#444' : '#ddd',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        minWidth: 60,
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        const currentHour = selectedDate.getHours();
                        const newHour = currentHour >= 12 ? currentHour - 12 : currentHour + 12;
                        const newDate = new Date(selectedDate);
                        newDate.setHours(newHour);
                        onWebTimeChange(newDate);
                      }}
                    >
                      <Text color={isDark ? '#fff' : '#000'} fontSize={18} fontFamily="$body" fontWeight="600">
                        {format(selectedDate, 'a')}
                      </Text>
                    </Pressable>
                  </YStack>
                </XStack>
                
                <XStack width="100%" justifyContent="space-between" gap="$4" mt="$3" px="$2">
                  <Button
                    onPress={() => setShowTimePicker(false)}
                    backgroundColor={"rgba(255, 0, 0, 0.12)"}
                    px="$2"
                    py="$1"
                    height={32}
                    br={12}
                    flex={1}
                    borderWidth={1}
                    borderColor={"rgba(255, 0, 0, 0.77)"}
                  >
                    <Text color={"rgba(255, 0, 0, 0.77)"} fontFamily="$body" fontWeight="500">Cancel</Text>
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
                <XStack width="70%" justifyContent="space-between" gap="$4" px="$2">
                  <Button
                    onPress={() => setShowTimePicker(false)}
                    backgroundColor={isDark ? "$gray3" : "transparent"}
                    px="$2"
                    py="$1"
                    height={32}
                    br={12}
                    flex={1}
                    borderWidth={1}
                    borderColor={"rgba(255, 0, 0, 0.77)"}
                  >
                    <Text color={"rgba(255, 0, 0, 0.77)"} fontFamily="$body" fontWeight="500">Cancel</Text>
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
