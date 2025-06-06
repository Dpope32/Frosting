import React, { useMemo } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { YStack, Text, Stack, isWeb } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { isIpad } from '@/utils';

export function YearCompleteSection() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { percentage, currentYear } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = Number(now) - Number(start);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    const isLeapYear = now.getFullYear() % 4 === 0 && (now.getFullYear() % 100 !== 0 || now.getFullYear() % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const percent = Math.round((day / daysInYear) * 100);
    const currentYear = now.getFullYear();
    return {
      percentage: percent,
      currentDay: day,  
      totalDays: daysInYear,
      currentYear,
    };
  }, []);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <YStack 
      width={isWeb ? "100%" :isIpad() ? "100%" : "98%"}
      alignSelf="center"
      alignItems="center"
      justifyContent="center"
      br={16}
      px="$3"
      pb="$2"
      pt={isIpad() ? "$3.5" : "$3"}
    >
      <Stack
        width="100%"
        height={isIpad() ? 30 : 32}
        br={16}
        overflow="hidden"
        borderWidth={1}
        borderColor={isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}
        position="relative"
      >
        <LinearGradient 
          colors={['#2193b0', '#6dd5ed', '#56ab2f', '#ff8c00', '#c53935', '#2193b0',]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
        />
        <Stack
          position="absolute"
          left={`${percentage}%`}
          top={0}
          width={`${100 - percentage}%`}
          height="100%"
          backgroundColor={isDark ? "#121212" : "rgba(0, 0, 0, 0.9)"}
          zIndex={1}
        />
        <Stack
          width="100%"
          height="100%"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          left={0}
          top={0}
          zIndex={2}
        >
          {percentage < 100 ? (
            <Text
              color="#dbd0c6"
              fontSize={14}
              fontWeight="bold"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.7)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3
              }}
            >
              {currentYear}
            </Text>
          ) : null}
        </Stack>
      </Stack>
      {[25, 50, 75, 100].includes(percentage) && (
        <Text
          fontSize={12}
          color={isDark ? '#dbd0c6' : '#555'}
          mt="$2"
        >
          {percentage === 100
            ? `🎉 Happy New Year! ${currentYear} completed!`
            : `🎉 ${percentage}% of ${currentYear} done! 🎉`}
        </Text>
      )}
    </YStack>
  );
}
