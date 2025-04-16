import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View, StyleSheet, Dimensions } from 'react-native';

const AnimatedCloud = ({
  isDark,
  index,
  sizeMultiplier = 1,
  opacityMultiplier = 1
}: {
  isDark: boolean;
  index: number;
  sizeMultiplier?: number;
  opacityMultiplier?: number;
}) => {
  // Base size for the cloud
  const baseSize = (14 + Math.random() * 5) * sizeMultiplier;
  
  // Horizontal movement based on wind (strictly left-to-right)
  const horizontalDrift = 8 + Math.random() * 4;
  const driftDuration = 15000 + index * 1000; // Slower, more consistent movement
  
  // Calculate screen width for percentage calculations
  const screenWidth = Dimensions.get('window').width;
  
  // Use numeric positions instead of percentage strings
  const initialHorizontalPos = (5 + Math.random() * 80) * screenWidth / 100;
  const verticalPosition = 15 + (index * 22);
  
  const offsetX = useSharedValue(0);
  
  // Set a fixed opacity value
  const cloudOpacity = 0.85 * opacityMultiplier;

  useEffect(() => {
    // Pure horizontal movement with linear motion
    offsetX.value = withRepeat(
      withTiming(horizontalDrift, { 
        duration: driftDuration, 
        easing: Easing.linear // Linear movement to avoid any bouncing effect
      }),
      -1, true
    );
  }, []);

  // Container style with fixed vertical position
  const staticStyle = {
    position: 'absolute',
    top: verticalPosition,
    left: initialHorizontalPos,
    zIndex: 1
  } as const;
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offsetX.value }]
    };
  });

  const cloudColor = "#FFFFFF";

  // Create cloud parts as a unified component with consistent colors
  const styles = StyleSheet.create({
    cloudWrapper: {
      position: 'relative',
      width: baseSize * 3.5,
      height: baseSize * 1.8, 
      opacity: cloudOpacity,
    },
    cloudPart1: {
      position: 'absolute',
      bottom: 0,
      left: baseSize * 0.5,
      width: baseSize * 2,
      height: baseSize,
      borderRadius: baseSize / 2,
      backgroundColor: cloudColor,
    },
    cloudPart2: {
      position: 'absolute',
      bottom: baseSize * 0.3,
      left: baseSize * 0.1,
      width: baseSize * 1.1,
      height: baseSize * 1.1,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart3: {
      position: 'absolute',
      bottom: baseSize * 0.4,
      left: baseSize * 1.2,
      width: baseSize * 1.3,
      height: baseSize * 1.3,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart4: {
      position: 'absolute',
      bottom: baseSize * 0.2,
      left: baseSize * 1.9,
      width: baseSize * 0.9,
      height: baseSize * 0.9,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    // New cloud parts for enhanced realism
    cloudPart5: {
      position: 'absolute',
      bottom: baseSize * 0.6,
      left: baseSize * 0.7,
      width: baseSize * 1.2,
      height: baseSize * 1.2,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart6: {
      position: 'absolute',
      bottom: baseSize * 0.5,
      left: baseSize * 2.3,
      width: baseSize * 1.0,
      height: baseSize * 1.0,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart7: {
      position: 'absolute',
      bottom: baseSize * 0.1,
      left: baseSize * 0.3,
      width: baseSize * 0.8,
      height: baseSize * 0.8,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart8: {
      position: 'absolute',
      bottom: baseSize * 0.25,
      left: baseSize * 1.5,
      width: baseSize * 0.7,
      height: baseSize * 0.7,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
  });

  return (
    <Animated.View style={[staticStyle, animatedStyle]}>
      <View style={styles.cloudWrapper}>
        <View style={styles.cloudPart1} />
        <View style={styles.cloudPart2} />
        <View style={styles.cloudPart3} />
        <View style={styles.cloudPart4} />
        <View style={styles.cloudPart5} />
        <View style={styles.cloudPart6} />
        <View style={styles.cloudPart7} />
        <View style={styles.cloudPart8} />
      </View>
    </Animated.View>
  );
};

export default AnimatedCloud; 