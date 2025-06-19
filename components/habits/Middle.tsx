import React from 'react';
import {  Platform } from 'react-native';
import { XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils';
import type { Habit } from '@/types';

interface MiddleProps {
  habit: Habit;
  doneToday: boolean;
}

export const Middle = ({ habit, doneToday }: MiddleProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';
  const notificationTime = habit.notificationTimeValue;
  const notificationTimeDate = notificationTime ? notificationTime : 'none';

  
  const formatTimeToStandard = (time: string): string => {
    if (!time || time === 'none') return 'No time set';
    const [hoursStr, minutesStr] = time.split(':');
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    if (isNaN(hours) || isNaN(minutes)) {
      return 'No time set';
    }
    const period = hours >= 12 ? 'PM' : 'AM';
    const standardHours = hours % 12 || 12; 
    return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <XStack mt={2} pb={isIpad() ? 4 : 3} gap={4} >
        <XStack
        alignItems="center"
        backgroundColor={isDark ? 'rgba(100, 148, 237, 0.07)' : 'rgba(100, 149, 237, 0.1)'}
        px={isMobile ? 10 : 8}
        py={1.5}
        br={10}
        alignSelf="flex-start"
        opacity={doneToday ? 0.6 : 0.9}
        >
        <Ionicons 
            name="time-outline" 
            size={isMobile ? 12 : 14} 
            color={isDark ? '#6495ED' : '#4682B4'} 
            style={{ marginRight: 4 }}
        />
        <Text 
            fontFamily="$body" 
            fontSize={isIpad() ? 14 : 12} 
            color={isDark ? '#6495ED' : '#4682B4'} 
            fontWeight="500"
        >
            {formatTimeToStandard(notificationTimeDate)}
        </Text>
        </XStack>
    </XStack>
    );
    };