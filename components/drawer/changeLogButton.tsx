import React from 'react';
import { TouchableOpacity, StyleSheet, useColorScheme, Platform, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Conditionally import Reanimated functions
let Animated: any = null;
let useSharedValue: any = null;
let useAnimatedStyle: any = null;
let withSpring: any = null;
let withTiming: any = null;
let Easing: any = null;
let interpolate: any = null;
let Extrapolation: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const Reanimated = require('react-native-reanimated');
    Animated = Reanimated.default;
    useSharedValue = Reanimated.useSharedValue;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withSpring = Reanimated.withSpring;
    withTiming = Reanimated.withTiming;
    Easing = Reanimated.Easing;
    interpolate = Reanimated.interpolate;
    Extrapolation = Reanimated.Extrapolation;
  } catch (error) {
    console.warn('Reanimated could not be loaded:', error);
  }
}

import { debouncedNavigate } from '@/utils/navigationUtils';

export const ChangeLogButton = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Only create animated values if not on web and Reanimated is available
  const animationProgress = Platform.OS !== 'web' && useSharedValue ? useSharedValue(0) : null;
  const scale = Platform.OS !== 'web' && useSharedValue ? useSharedValue(1) : null;

  const handlePress = () => {
    if (Platform.OS !== 'web' && scale && animationProgress && withSpring && withTiming && Easing) {
      // Apply quick scale feedback and immediately navigate
      scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
      animationProgress.value = withTiming(1, {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
    
    // Navigate with debouncing to prevent multiple rapid opens
    debouncedNavigate('/modals/changelog');
    
    // Reset scale after navigation starts
    if (Platform.OS !== 'web' && scale && withSpring) {
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }, 50);
    }
  };

  const buttonStyle = Platform.OS !== 'web' && useAnimatedStyle && scale
    ? useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
    : { transform: [{ scale: 1 }] };

  const rippleStyle = Platform.OS !== 'web' && useAnimatedStyle && animationProgress && interpolate && Extrapolation
    ? useAnimatedStyle(() => {
        const rippleScale = interpolate(
          animationProgress.value,
          [0, 1],
          [0, 4],
          Extrapolation.CLAMP
        );
        const opacity = interpolate(
          animationProgress.value,
          [0, 0.5, 1],
          [0, 0.3, 0],
          Extrapolation.CLAMP
        );
        return {
          transform: [{ scale: rippleScale }],
          opacity,
        };
      })
    : { transform: [{ scale: 0 }], opacity: 0 };

  const AnimatedView = Platform.OS !== 'web' && Animated ? Animated.View : View;

  return (
    <AnimatedView style={[styles.circle, buttonStyle]}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <MaterialIcons 
          name="history" 
          size={24} 
          color={isDark ? '#708090' : '#708090'} 
        />
        <AnimatedView 
          style={[
            styles.ripple, 
            { backgroundColor: isDark ? '#708090' : '#708090' },
            rippleStyle
          ]} 
        />
      </TouchableOpacity>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  touchable: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
});
