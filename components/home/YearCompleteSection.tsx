import React, { useMemo, useState, useEffect } from 'react';
import { Platform, useColorScheme, Pressable } from 'react-native';
import { YStack, Text, Stack, isWeb } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { isIpad } from '@/utils';
import { EasterEgg } from '../shared/EasterEgg';

export function YearCompleteSection() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // Animation values for press effect
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Timer ref for 3-second delay
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.8, { duration: 150 });
    
    // Start 3-second timer
    timerRef.current = setTimeout(() => {
      setShowEasterEgg(true);
      // Clear timer ref after it fires
      timerRef.current = null;
    }, 3000);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
    
    // Clear timer if press is released before 3 seconds
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePress = () => {
    // This handles tap releases, but main logic is in pressIn/pressOut
  };

  const handleEasterEggEnd = () => {
    setShowEasterEgg(false);
    // Ensure timer is cleared when easter egg ends
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <>
      <YStack 
        width={isWeb ? "100%" : isIpad() ? "100%" : "98%"}
        alignSelf="center"
        alignItems="center"
        justifyContent="flex-end"
        br={16}
        px="$3"
        pb="$4"
        pt={isIpad() ? "$3.5" : "$3"}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={{
            width: "100%",
            height: isIpad() ? 52 : 48,  
            borderRadius: 16,
          }}
        >
          <Animated.View style={animatedStyle}>
            <Stack
              width="100%"
              height={isIpad() ? 30 : 28}
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
          </Animated.View>
        </Pressable>
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
      <EasterEgg 
        visible={showEasterEgg} 
        onAnimationEnd={handleEasterEggEnd}
      />
    </>
  );
}
