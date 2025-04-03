import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

import { DimensionValue } from 'react-native';

interface RainDropProps {
  delay: number;
  duration: number;
  initialX: DimensionValue; // Use DimensionValue for better type safety
  startY: number;
  endY: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  rotation?: number;
}

const RainDrop: React.FC<RainDropProps> = ({
  delay,
  duration,
  initialX,
  startY,
  endY,
  width,
  height,
  color,
  opacity: targetOpacity, // Rename to avoid conflict with animatedOpacity
  rotation = -30, // Default rotation matching common CSS rain
}) => {
  const translateY = useSharedValue(startY);
  const animatedOpacity = useSharedValue(0); // Start invisible

  useEffect(() => {
    // Use withDelay to handle the animation start time
    // Use withSequence to fade in, then start the repeating fall
    translateY.value = withDelay(
      delay * 1000, // Convert delay seconds to ms
      withRepeat(
        withSequence(
          // Reset position to startY before each fall (ensures clean loop)
          withTiming(startY, { duration: 0 }),
          // Fade in quickly
          withTiming(startY, { duration: 50 }, () => { // Use callback to set opacity
            animatedOpacity.value = withTiming(targetOpacity, { duration: 100 });
          }),
          // Fall down
          withTiming(endY, {
            duration: duration * 1000, // Convert duration seconds to ms
            easing: Easing.linear,
          }),
          // Fade out at the end (optional, but can look smoother)
           withTiming(endY, { duration: 50 }, () => {
             animatedOpacity.value = withTiming(0, { duration: 100 });
           })
        ),
        -1, // Infinite repeat
        false // Don't reverse
      )
    );

    // Cleanup function not strictly needed for shared values,
    // but good practice if managing other side effects.
    return () => {
        // Optional: Cancel animation if component unmounts mid-animation
        // cancelAnimation(translateY);
        // cancelAnimation(animatedOpacity);
    };
  }, [delay, duration, endY, startY, targetOpacity, translateY, animatedOpacity]);

  const animatedStyle = useAnimatedStyle((): ViewStyle => {
    return {
      position: 'absolute',
      left: initialX,
      width: width,
      height: height,
      backgroundColor: color,
      opacity: animatedOpacity.value,
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  // Use Animated.View for the animated styles
  return <Animated.View style={animatedStyle} />;
};

export default RainDrop;
