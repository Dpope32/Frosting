import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { View, StyleSheet, Dimensions } from 'react-native';

type CloudType = 'light' | 'medium' | 'dark' | 'storm';

const AnimatedCloud = ({
  isDark,
  index,
  sizeMultiplier = 1,
  opacityMultiplier = 1,
  cloudType = 'medium',
  useDarkerShade = false
}: {
  isDark: boolean;
  index: number;
  sizeMultiplier?: number;
  opacityMultiplier?: number;
  cloudType?: CloudType;
  useDarkerShade?: boolean;
}) => {
  // Base size for the cloud - varies by cloud type
  let baseSize = (20 + Math.random() * 5) * sizeMultiplier;
  
  // Adjust size based on cloud type
  if (cloudType === 'light') {
    baseSize *= 0.85; // Smaller, fluffier
  } else if (cloudType === 'dark' || cloudType === 'storm') {
    baseSize *= 1.15; // Larger, more imposing
  }
  
  // Horizontal movement based on wind (strictly left-to-right)
  const horizontalDrift = 8 + Math.random() * 4;
  const driftDuration = 15000 + index * 800; // Slower, more consistent movement
  
  // Calculate screen width for percentage calculations
  const screenWidth = Dimensions.get('window').width;
  
  // Use numeric positions instead of percentage strings
  const initialHorizontalPos = (5 + Math.random() * 80) * screenWidth / 100;
  const verticalPosition = 15 + (index * 22);
  
  const offsetX = useSharedValue(0);
  
  // Set opacity based on cloud type
  let cloudOpacity = 0.5 * opacityMultiplier;
  if (cloudType === 'light') {
    cloudOpacity *= 0.7; // Lighter clouds are more transparent
  } else if (cloudType === 'dark') {
    cloudOpacity *= 1.1; // Darker clouds more opaque
  } else if (cloudType === 'storm') {
    cloudOpacity *= 1.2; // Storm clouds very opaque
  }

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

  // Set cloud color based on type
  let cloudColor;
  if (cloudType === 'light') {
    cloudColor = isDark ? '#F3F4F6' : '#FFFFFF';
  } else if (cloudType === 'medium') {
    cloudColor = isDark ? '#E5E7EB' : '#FFFFFF';
  } else if (cloudType === 'dark') {
    cloudColor = isDark ? '#D1D5DB' : '#F9FAFB';
  } else if (cloudType === 'storm') {
    cloudColor = isDark ? '#9CA3AF' : '#E5E7EB';
  } else {
    cloudColor = isDark ? '#E5E7EB' : '#FFFFFF';
  }
  
  // Apply darker shade if requested (for partly cloudy situations)
  if (useDarkerShade) {
    if (isDark) {
      cloudColor = cloudType === 'storm' ? '#6B7280' : '#9CA3AF';
    } else {
      cloudColor = cloudType === 'storm' ? '#9CA3AF' : '#E5E7EB';
    }
  }
  
  const shadowStyle = isDark ? {
    shadowColor: '#000',
    shadowOpacity: cloudType === 'storm' ? 0.4 : 0.3,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: cloudType === 'storm' ? 2 : 1.5,
  } : {
    shadowColor: '#000',
    shadowOpacity: cloudType === 'storm' ? 0.15 : 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: cloudType === 'storm' ? 2 : 1.5,
  };

  // Adjust cloud shape based on cloud type
  let cloudWidth = baseSize * 3.5;
  let cloudHeight = baseSize * 1.8;
  
    // Adjust cloud dimensions based on type
    if (cloudType === 'storm') {
      cloudWidth = baseSize * 3.8;
      cloudHeight = baseSize * 2;
    } else if (cloudType === 'dark') {
      cloudWidth = baseSize * 3.6;
      cloudHeight = baseSize * 1.9;
    } else if (cloudType === 'light') {
      // Light clouds are smaller and more delicate
      cloudWidth = baseSize * 3.2;
      cloudHeight = baseSize * 1.6;
    }
  
  // Create cloud parts as a unified component with consistent colors
  const styles = StyleSheet.create({
    cloudWrapper: {
      position: 'relative',
      width: cloudWidth,
      height: cloudHeight, 
      opacity: cloudOpacity,
      ...shadowStyle,
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
      width: baseSize * 1.6,
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
      bottom: baseSize * 0.4,
      left: baseSize * 1.9,
      width: baseSize * 0.9,
      height: baseSize * 0.9,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart5: {
      position: 'absolute',
      bottom: baseSize * 0.6,
      left: baseSize * 0.4,
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
      bottom: baseSize * 0.4,
      left: baseSize * 0.3,
      width: baseSize * 0.8,
      height: baseSize * 0.8,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    cloudPart8: {
      position: 'absolute',
      bottom: baseSize * 0.25,
      left: baseSize * 1.9,
      width: baseSize * 0.7,
      height: baseSize * 0.7,
      borderRadius: baseSize,
      backgroundColor: cloudColor,
    },
    // Additional parts for storm clouds - reshaped to look more like real storm clouds
    stormCloudExtra1: {
      position: 'absolute',
      bottom: baseSize * 0.8,
      left: baseSize * 2.4,
      width: baseSize * 1.1,
      height: baseSize * 1.0,
      borderRadius: baseSize / 2,
      backgroundColor: cloudColor,
    },
    stormCloudExtra2: {
      position: 'absolute',
      bottom: baseSize * 0.2,
      left: baseSize * 2.2,
      width: baseSize * 1.0,
      height: baseSize * 0.8,
      borderRadius: baseSize / 2,
      backgroundColor: cloudColor,
    }
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
        {cloudType === 'storm' && (
          <>
            <View style={styles.stormCloudExtra1} />
            <View style={styles.stormCloudExtra2} />
          </>
        )}
      </View>
    </Animated.View>
  );
};

export default AnimatedCloud;
