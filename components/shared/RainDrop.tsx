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
  initialX: DimensionValue;
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
  opacity: targetOpacity,
  rotation = -30,
}) => {
  const translateY = useSharedValue(startY);
  const animatedOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(startY, { duration: 0 }),
          withTiming(startY, { duration: 50 }, () => {
            animatedOpacity.value = withTiming(targetOpacity, { duration: 100 });
          }),
          withTiming(endY, {
            duration: duration * 1000,
            easing: Easing.linear,
          }),
           withTiming(endY, { duration: 50 }, () => {
             animatedOpacity.value = withTiming(0, { duration: 100 });
           })
        ),
        -1,
        false
      )
    );

    return () => {

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

  return <Animated.View style={animatedStyle} />;
};

export default RainDrop;
