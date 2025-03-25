import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { YStack, Text, Stack } from 'tamagui';
import { LinearGradient } from '@tamagui/linear-gradient';
import { getYearProgress } from '@/services/calculationService';

export function YearCompleteSection() {
  // Calculate the year progress using the service function
  const { percentage, currentDay, totalDays } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = Number(now) - Number(start);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const isLeapYear = now.getFullYear() % 4 === 0 && 
      (now.getFullYear() % 100 !== 0 || now.getFullYear() % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const percent = Math.round((day / daysInYear) * 100);
    
    return {
      percentage: percent,
      currentDay: day,
      totalDays: daysInYear
    };
  }, []);

  // Only show on mobile
  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <YStack padding="$2" width="100%">
      {/* Progress bar container */}
      <Stack width="100%" height={24} borderRadius={12} overflow="hidden" backgroundColor="rgba(30, 30, 30, 0.3)" borderWidth={1} borderColor="rgba(255, 255, 255, 0.1)" marginVertical="$2">
        {/* Gradient fill */}
        <Stack 
          position="absolute" 
          left={0} 
          top={0} 
          bottom={0} 
          width={`${percentage}%`} 
          overflow="hidden"
        >
          {/* Gradient that's stretched across what would be the full bar */}
          <Stack width={`${100 / (percentage / 100)}%`} height="100%">
            <LinearGradient
              width="100%"
              height="100%"
              colors={['#2193b0', '#6dd5ed', '#56ab2f', '#ff8c00', '#e53935', '#8e2de2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Stack>
        </Stack>
        
        {/* Text layer - using flexbox for perfect centering */}
        <Stack 
          width="100%" 
          height="100%" 
          justifyContent="center" 
          alignItems="center"
        >
          <Text 
            color="#f2f2f2" 
            fontSize={12} 
            fontWeight="bold"
            style={{ 
              textShadowColor: 'rgba(0, 0, 0, 0.5)', 
              textShadowOffset: { width: 0, height: 1 }, 
              textShadowRadius: 2 
            }}
          >
            {percentage}% complete`
          </Text>
        </Stack>
      </Stack>
      
      <Text color="#dbd0c6" fontSize={12} textAlign="center" opacity={0.8}>
        {`${totalDays - currentDay} days remaining in ${new Date().getFullYear()}`}
      </Text>
    </YStack>
  );
}