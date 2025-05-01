import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EasterEggProps {
  visible: boolean;
  onAnimationEnd?: () => void;
}

const IMAGE_SIZE = 110; // Smaller size
const ANIMATION_DURATION = 600; // ms
const SCALE_DURATION = 300;
const FLIP_DURATION = 400;
const DELAY_BEFORE_EXIT = 700;

export const EasterEgg: React.FC<EasterEggProps> = ({ visible, onAnimationEnd }) => {
  // 30% down from the top
  const targetY = SCREEN_HEIGHT * 0.05;
  const translateY = useSharedValue(-IMAGE_SIZE); // Start above the screen
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Sequence: fade in + slide down, pulse, flip, wait, then slide up and fade out
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSequence(
        withTiming(targetY, { duration: ANIMATION_DURATION }), // Slide down to center
        withDelay(
          DELAY_BEFORE_EXIT + FLIP_DURATION + SCALE_DURATION * 2,
          withTiming(-IMAGE_SIZE, { duration: ANIMATION_DURATION }, (finished) => {
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
      rotateY.value = withSequence(
        withDelay(
          ANIMATION_DURATION + SCALE_DURATION * 2,
          withTiming(360, { duration: FLIP_DURATION })
        ),
        withDelay(DELAY_BEFORE_EXIT, withTiming(0, { duration: 0 })) // Reset for next time
      );
    } else {
      // Reset
      translateY.value = -IMAGE_SIZE;
      scale.value = 1;
      opacity.value = 0;
      rotateY.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotateY: `${rotateY.value}deg` },
    ],
    opacity: opacity.value,
    backfaceVisibility: 'hidden',
  }));

  if (!visible) return null;

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image
          source={require('../../assets/images/pog2.png')}
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
