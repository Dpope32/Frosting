import React, { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { YStack, Text, Stack } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

export function YearCompleteSection() {
  const colorScheme = useColorScheme();

  // Calculate the year progress
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
    <YStack 
      padding="$2" 
      width="100%"
      br={16}
      px="$3"
      py="$3"
    >
      {/* Progress bar container - Increased height, removed bg/border, removed margin */}
      <Stack width="100%" height={40} br={12} overflow="hidden">
        {/* Gradient fill container */}
        <Stack 
          position="absolute" 
          left={0} 
          top={0} 
          bottom={0} 
          width={`${percentage}%`} 
          overflow="hidden"
        >
          {/* Gradient that's stretched across what would be the full bar - Simplified nesting */}
          <Stack width={`${100 / (percentage / 100)}%`} height="100%">
            <LinearGradient
              colors={['#2193b0', '#6dd5ed', '#56ab2f', '#ff8c00', '#e53935', '#8e2de2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
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
          {percentage < 100 ? (
            <Text 
              color="#f2f2f2" 
              fontSize={14}
              fontWeight="bold"
              style={{ 
                textShadowColor: 'rgba(0, 0, 0, 0.7)',
                textShadowOffset: { width: 0, height: 1 }, 
                textShadowRadius: 3 
              }}
            >
              {percentage}% complete
            </Text>
          ) : null}
        </Stack>
      </Stack>
      
      <Text color="#dbd0c6" fontSize={12} textAlign="center" opacity={0.8}>
        {`${totalDays - currentDay} days remaining in ${new Date().getFullYear()}`}
      </Text>
    </YStack>
  );
}
