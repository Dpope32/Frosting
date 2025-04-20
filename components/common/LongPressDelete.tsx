import React from 'react'
import { View } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  runOnJS,
  Easing,
  cancelAnimation,
  interpolate
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { XStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

interface LongPressDeleteProps {
  onDelete: () => void
  children: React.ReactNode
}

export const LongPressDelete: React.FC<LongPressDeleteProps> = ({ onDelete, children }) => {
  const scale = useSharedValue(1)
  const progress = useSharedValue(0)
  const isReady = useSharedValue(false)
  const LONG_PRESS_DURATION = 800

  const handleHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleReadyHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  }

  const handleNotificationFeedback = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  const longPressGesture = Gesture.LongPress()
    .minDuration(50)
    .onBegin(() => {
      'worklet';
      isReady.value = false;
      runOnJS(handleHapticFeedback)();
      scale.value = withSpring(1.02, { damping: 15, stiffness: 100 });
      progress.value = withTiming(1, { 
        duration: LONG_PRESS_DURATION,
        easing: Easing.linear 
      }, (finished) => {
        if (finished) {
          isReady.value = true;
          runOnJS(handleReadyHaptic)();
        }
      });
    })
    .onFinalize(() => {
      'worklet';
      if (isReady.value) {
        runOnJS(handleNotificationFeedback)();
        runOnJS(onDelete)();
      }
      isReady.value = false;
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      progress.value = withTiming(0, { duration: 200 });
    })
    .onTouchesMove(() => {
      'worklet';
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      isReady.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: scale.value }],
    position: 'relative',
  }));

  const progressStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: `${progress.value * 100}%`,
    backgroundColor: '#ff3b30',
    borderRadius: 2,
    zIndex: 999,
  }));

  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff3b30',
    opacity: interpolate(progress.value, [0, 1], [0, 0.1]),
    borderRadius: 8,
    zIndex: 1,
  }));

  const deleteTextStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
    opacity: progress.value,
    zIndex: 2,
  }));

  return (
    <GestureDetector gesture={longPressGesture}>
      <Animated.View style={animatedStyle}>
        <Animated.View style={deleteIndicatorStyle} />
        <View style={{ zIndex: 3 }}>{children}</View>
        <Animated.View style={deleteTextStyle}>
          <XStack gap="$2" ai="center">
            <Ionicons name="trash-outline" size={16} color="#ff3b30" />
            <Text color="#ff3b30" fontSize={12} fontWeight="500">Release to Delete</Text>
          </XStack>
        </Animated.View>
        <Animated.View style={progressStyle} />
      </Animated.View>
    </GestureDetector>
  );
} 