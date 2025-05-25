import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface RainDropProps {
  delay: number;
  duration: number;
  initialX: number;
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
  opacity,
  rotation = -15, // Gentler rotation
}) => {
  const translateY = useSharedValue(startY);

  useEffect(() => {
    // Simple delayed start with smooth repeat
    const timer = setTimeout(() => {
      translateY.value = withRepeat(
        withTiming(endY, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, duration, endY, translateY]);

  const animatedStyle = useAnimatedStyle((): ViewStyle => {
    return {
      position: 'absolute',
      left: initialX,
      width: width,
      height: height,
      backgroundColor: color,
      opacity: opacity,
      borderRadius: width / 2,
      transform: [
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ],
    };
  });

  return <Animated.View style={animatedStyle} />;
};

export default RainDrop;
