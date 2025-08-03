import React, { useEffect } from 'react';
import { Platform, useColorScheme, View } from 'react-native';
import { YStack, Stack, Text, isWeb } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';

// Conditionally import Reanimated functions
let Animated: any = null;
let useSharedValue: any = null;
let useAnimatedStyle: any = null;
let withTiming: any = null;
let withSpring: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const Reanimated = require('react-native-reanimated');
    Animated = Reanimated.default;
    useSharedValue = Reanimated.useSharedValue;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withTiming = Reanimated.withTiming;
    withSpring = Reanimated.withSpring;
  } catch (error) {
    console.warn('Reanimated could not be loaded:', error);
  }
}

import { isIpad } from '@/utils';

interface TaskProgressBarProps {
  completedTasks: number;
  totalTasks: number;
}

export function TaskProgressBar({ completedTasks, totalTasks }: TaskProgressBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Calculate percentage
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Animated values - only create if not on web and Reanimated is available
  const progress = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const scale = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0.8) : null;
  const opacity = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;

  // Animation when percentage changes
  useEffect(() => {
    if (Platform.OS !== 'web' && opacity && scale && progress && withTiming && withSpring) {
      // Entry animation
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      
      // Progress animation - much faster for immediate feedback
      progress.value = withTiming(percentage / 100, { 
        duration: 350 
      });
    }
  }, [percentage, opacity, scale, progress, withTiming, withSpring]);

  // Animated styles - only create if not on web and Reanimated is available
  const containerStyle = Platform.OS !== 'web' && useAnimatedStyle && opacity && scale
    ? useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
      }))
    : { opacity: 1, transform: [{ scale: 1 }] };

  const progressStyle = Platform.OS !== 'web' && useAnimatedStyle && progress
    ? useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
      }))
    : { width: `${percentage}%` };

  // Don't render if no tasks or only 1 task
  if (totalTasks <= 1) {
    return null;
  }

  const AnimatedView = Platform.OS !== 'web' && Animated ? Animated.View : View;

  return (
    <AnimatedView style={containerStyle}>
      <YStack 
        width={isWeb ? "95%" : isIpad() ? "80%" : "99%"}
        alignSelf="center"
        alignItems="center"
        justifyContent="center"
        br={12}
        px={isWeb ? "$3" : isIpad() ? "$4" : "$4"}
        pb="$2"
        pt="$1"
      >
        <Stack
          width="100%"
          height={isWeb ? 18 : isIpad() ? 16 : 12}
          br={12}
          overflow="hidden"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.2)"}
          position="relative"
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.1)"}
        >
          <AnimatedView style={[{ 
            position: "absolute", 
            left: 0, 
            top: 0, 
            height: "100%",
            borderRadius: 12,
            overflow: 'hidden'
          }, progressStyle]}>
            <LinearGradient 
              colors={
                percentage === 100 
                  ? ['#4ade80', '#22c55e', '#16a34a'] 
                  : percentage >= 75 
                  ? ['#3b82f6', '#1d4ed8', '#1e40af'] 
                  : percentage >= 50
                  ? ['#f59e0b', '#d97706', '#b45309'] 
                  : ['#6366f1', '#4f46e5', '#4338ca']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ 
                width: "100%", 
                height: "100%",
              }}
            />
          </AnimatedView>
        </Stack>
      </YStack>
    </AnimatedView>
  );
} 