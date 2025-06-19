import React from 'react';
import { Platform } from 'react-native';
import { XStack, Text } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isIpad } from '@/utils';
import type { Habit } from '@/types';

interface MessageProps {
  habit: Habit;
  doneToday: boolean;
}

export const Message = ({ habit, doneToday }: MessageProps) => {
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark';
  const isMobile = Platform.OS !== 'web';

  return (
<XStack 
alignItems="center"
backgroundColor={isDark ? 'rgba(177, 156, 217, 0.07)' : 'rgba(147, 112, 219, 0.08)'}
px={isMobile ? 4 : 2}
py={isMobile ? 2 : 1}
borderRadius={10}
alignSelf="flex-start"
opacity={doneToday ? 0.6 : 0.7}
>
<Ionicons 
    name="notifications-outline" 
    size={isMobile ? 14 : 10} 
    color={isDark ? '#B19CD9' : '#9370DB'} 
    style={{ paddingRight: 2 }}
/>
<Text 
    fontFamily="$body" 
    fontSize={isIpad() ? 15 : 12} 
    color={isDark ? '#B19CD9' : '#9370DB'} 
    fontWeight="500"
>
    {habit.customMessage}
</Text>
    </XStack>
  );
};