import { useEffect } from 'react';
import { 
  useSharedValue, 
  withTiming,
  Easing,
  useAnimatedStyle
} from 'react-native-reanimated';

export function useCardAnimation(visible: boolean) {
  const scale = useSharedValue(1.5);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = 1.5;
      opacity.value = 0;
      backdropOpacity.value = 0;
      
      scale.value = withTiming(1, { 
        duration: 500,
        easing: Easing.out(Easing.exp)
      });
      opacity.value = withTiming(1, { 
        duration: 400,
        easing: Easing.out(Easing.exp)
      });
      backdropOpacity.value = withTiming(1, { 
        duration: 300,
        easing: Easing.out(Easing.exp)
      });
    } else {
      scale.value = withTiming(1.5, { 
        duration: 250,
        easing: Easing.in(Easing.exp)
      });
      opacity.value = withTiming(0, { 
        duration: 200,
        easing: Easing.in(Easing.exp)
      });
      backdropOpacity.value = withTiming(0, { 
        duration: 200,
        easing: Easing.in(Easing.exp)
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value
  }));

  return { animatedStyle, backdropStyle };
}
