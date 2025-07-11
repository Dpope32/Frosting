import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import { isWeb } from 'tamagui';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEasterEggStore } from '../../store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const OFFSCREEN_Y = -SCREEN_HEIGHT - 500;

interface EasterEggProps {
  visible: boolean;
  onAnimationEnd?: () => void;
}

const IMAGE_SIZE = 200; // Smaller size
const ANIMATION_DURATION = 700; // ms
const SCALE_DURATION = 300;
const SPIN_DURATION = 900;
const DELAY_BEFORE_EXIT = 700;

export const EasterEgg: React.FC<EasterEggProps> = ({ visible, onAnimationEnd }) => {
  const { getCurrentImage, cycleToNextImage } = useEasterEggStore();
  
  // Move to top center of screen (40% up from center)
  const targetY = -SCREEN_HEIGHT * 0.1;
  const translateY = useSharedValue(OFFSCREEN_Y); // Start far above the screen
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Cycle to next image when animation starts
      cycleToNextImage();
      
      // Sequence: fade in + slide down, pulse, wait, then spin+slide up and fade out
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSequence(
        withTiming(targetY, { duration: ANIMATION_DURATION }), // Slide down to center
        withDelay(
          DELAY_BEFORE_EXIT + SCALE_DURATION * 2,
          withTiming(OFFSCREEN_Y, { duration: ANIMATION_DURATION }, (finished) => {
            if (finished && onAnimationEnd) runOnJS(onAnimationEnd)();
          })
        )
      );
      scale.value = withSequence(
        withDelay(
          ANIMATION_DURATION,
          withTiming(1.25, { duration: SCALE_DURATION })
        ),
        withTiming(1, { duration: SCALE_DURATION })
      );
      rotateZ.value = withSequence(
        withDelay(
          ANIMATION_DURATION + SCALE_DURATION * 2 + DELAY_BEFORE_EXIT / 2,
          withTiming(720, { duration: SPIN_DURATION })
        ),
        withTiming(0, { duration: 0 }) // Reset for next time
      );
    } else {
      // Reset
      translateY.value = OFFSCREEN_Y;
      scale.value = 1;
      opacity.value = 0;
      rotateZ.value = 0;
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      }
    }
  }, [visible, cycleToNextImage]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
    opacity: opacity.value,
    backfaceVisibility: 'hidden',
  }));

  if (!visible) return null;

  return (
    <Animated.View style={styles.container} pointerEvents="box-none">
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={getCurrentImage()}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  imageContainer: {
    position: 'absolute',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
});

export default EasterEgg;
