import React from 'react'
import { View, Platform, Pressable, StyleSheet } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  cancelAnimation,
  interpolate,
  withDelay
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { XStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

interface LongPressDeleteProps {
  onDelete: (onComplete: (deleted: boolean) => void) => void
  children: React.ReactNode
  progressBarStyle?: {
    paddingHorizontal?: number
  }
  longPressDuration?: number
}

export const LongPressDelete: React.FC<LongPressDeleteProps> = ({ 
  onDelete, 
  children,
  progressBarStyle,
  longPressDuration = 800
}) => {
  const scale = useSharedValue(1)
  const progress = useSharedValue(0)
  const isDeleting = useSharedValue(false)
  const screen = Platform.OS
  
  const handleReadyHaptic = () => {
    if (screen !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
  }
  
  const handleNotificationFeedback = () => {
    if (screen !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  const triggerDeleteAction = () => {
    if (!isDeleting.value) {
      isDeleting.value = true;
      runOnJS(handleNotificationFeedback)();
      runOnJS(onDelete)((deleted: boolean) => {
        'worklet';
        if (!deleted) {
          scale.value = withSpring(1, { damping: 15, stiffness: 100 });
          progress.value = withTiming(0, { duration: 200 });
          isDeleting.value = false;
        }
      });
    }
  };
  
  const longPressGesture = Gesture.LongPress()
    .minDuration(50)
    .hitSlop({ left: 0, right: -32, top: 0, bottom: 0 })
    .onBegin(() => {
      'worklet';
      isDeleting.value = false;
      scale.value = withDelay(
        500,
        withSpring(1.02, { damping: 15, stiffness: 100 })
      );
      progress.value = withDelay(
        500,
        withTiming(1, {
          duration: longPressDuration,
          easing: Easing.linear
        }, (finished) => {
          'worklet';
          if (finished) {
            runOnJS(handleReadyHaptic)();
            runOnJS(triggerDeleteAction)();
          }
        })
      );
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      progress.value = withTiming(0, { duration: 200 });
      isDeleting.value = false;
    })
    .onTouchesMove(() => {
      'worklet';
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      isDeleting.value = false;
    });
    
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    position: 'relative',
  }));
  
  const progressStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 0,
    left: progressBarStyle?.paddingHorizontal || 0,
    right: progressBarStyle?.paddingHorizontal || 0,
    height: 2,
    width: `${progress.value * 95}%`,
    borderRadius: 2,
    zIndex: 999,
    margin: 0,
    padding: 0,
  }));
  
  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: interpolate(progress.value, [0, 1], [0, 0.1]),
    borderRadius: 8,
    zIndex: 1,
    margin: 0,
    padding: 0,
  }));
  
  const deleteTextStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    opacity: progress.value,
    zIndex: 2,
    margin: 0,
    padding: 0,
  }));

  const dimOverlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    opacity: interpolate(progress.value, [0, 1], [0, 0.5]),
    zIndex: 1,
    margin: 0,
    padding: 0,
  }));

  const webTimer = React.useRef<NodeJS.Timeout>()
  
  const handlePressIn = () => {
    if (screen === 'web') {
      webTimer.current = setTimeout(() => {
        isDeleting.value = true;
        onDelete((deleted) => {
          if (!deleted) {
            scale.value = withSpring(1, { damping: 15, stiffness: 100 });
            progress.value = withTiming(0, { duration: 200 });
            isDeleting.value = false;
          }
        });
      }, longPressDuration);
    }
  }
  
  const handlePressOut = () => {
    if (screen === 'web') {
      clearTimeout(webTimer.current);
      if (!isDeleting.value) {
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        progress.value = withTiming(0, { duration: 200 });
      }
    }
  }

  const content = (
    <>
      <Animated.View style={deleteIndicatorStyle}>
        <LinearGradient
          colors={['#ffffff', '#ff3b30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { margin: 0, padding: 0 }]}
        />
      </Animated.View>
      <Animated.View style={dimOverlayStyle} />
      <View style={{ zIndex: 3, margin: 0, padding: 0 }}>{children}</View>
      <Animated.View style={deleteTextStyle}>
        <XStack gap="$2" ai="center" justifyContent="center">
          <Ionicons name="trash-outline" size={16} color="#ff3b30" />
          <Text color="#ff3b30" fontSize={12} fontWeight="500">Delete</Text>
        </XStack>
      </Animated.View>
      <Animated.View style={progressStyle}>
        <LinearGradient
          colors={['#ffffff', '#ff3b30']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { margin: 0, padding: 0 }]}
        />
      </Animated.View>
    </>
  );
  
  return screen === 'web'
    ? <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}><Animated.View style={animatedStyle}>{content}</Animated.View></Pressable>
    : <GestureDetector gesture={longPressGesture}><Animated.View style={animatedStyle}>{content}</Animated.View></GestureDetector>
}
