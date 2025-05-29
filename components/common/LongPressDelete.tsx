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
  isDark?: boolean
}

export const LongPressDelete: React.FC<LongPressDeleteProps> = ({ 
  onDelete, 
  children,
  progressBarStyle,
  longPressDuration = 650,
  isDark = false
}) => {
  const scale = useSharedValue(1)
  const progress = useSharedValue(0)
  const isDeleting = useSharedValue(false)
  const screen = Platform.OS
  
  const delayBeforeFeedback = 1000;
  const animationDuration = longPressDuration || 650;

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

  const triggerDeleteAction = React.useCallback(() => {
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
  }, [onDelete, handleNotificationFeedback, isDeleting, scale, progress]);
  
  const longPressGesture = Gesture.LongPress()
    .minDuration(delayBeforeFeedback)
    .maxDistance(5)
    .hitSlop({ left: 0, right: -40, top: 0, bottom: 0 }) // Increased right margin to avoid checkbox
    .onStart(() => { // Changed from onBegin to onStart - this only fires after the 1-second delay
      console.log('LongPress Gesture: onStart - Long press activated after delay.');
      'worklet';
      isDeleting.value = false;
      progress.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.linear
      }, (finished) => {
        console.log('LongPress Gesture: Animation finished, triggering delete.');
        'worklet';
        if (finished && progress.value === 1) {
          runOnJS(handleReadyHaptic)();
          runOnJS(triggerDeleteAction)();
        }
      });
      scale.value = withDelay(100, withSpring(1.02, { damping: 15, stiffness: 100 }));
    })
    .onFinalize(() => {
      console.log('LongPress Gesture: onFinalize. isDeleting:', isDeleting.value);
      'worklet';
      if (!isDeleting.value) {
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        progress.value = withTiming(0, { duration: 200 });
      }
    })
    .onTouchesMove(() => {
      console.log('LongPress Gesture: onTouchesMove - Cancelling due to movement');
      'worklet';
      cancelAnimation(progress);
      progress.value = withTiming(0, { duration: 200 });
      cancelAnimation(scale);
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
    left: 0,
    right: 0,
    height: 2,
    width: `${progress.value * 100}%`,
    borderRadius: 16,
    zIndex: 999,
    marginTop: 0,
    padding: 0,
  }));
  
  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.05, 0.1]),
    borderRadius: 16,
    zIndex: 1,
    marginTop: 0,
    padding: 0,
  }));
  
  const deleteTextStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    opacity: interpolate(progress.value, [0, 0.8, 1], [0, 0.5, 1]),
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
    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.3)',
    opacity: interpolate(progress.value, [0, 1], [0, 0.5]),
    zIndex: 1,
    margin: 0,
    padding: 0,
  }));

  const webDelayTimer = React.useRef<NodeJS.Timeout>();
  const webAnimationTimer = React.useRef<NodeJS.Timeout>();
  
  const contentZIndex = 2;
  const overlayZIndex = 3;
  const textZIndex = 4;
  const progressZIndex = 1;
  
  const handlePressIn = () => {
    console.log('Web: handlePressIn');
    if (screen === 'web') {
      isDeleting.value = false;

      webDelayTimer.current = setTimeout(() => {
        if (webDelayTimer.current !== null) {
          console.log('Web: Starting animation after delay');
          scale.value = withDelay(100, withSpring(1.02, { damping: 15, stiffness: 100 }));
          progress.value = withTiming(1, {
            duration: animationDuration,
            easing: Easing.linear
          });

          webAnimationTimer.current = setTimeout(() => { 
            runOnJS(handleReadyHaptic)(); 
            runOnJS(triggerDeleteAction)(); 
          }, animationDuration);
        }
      }, delayBeforeFeedback);
    }
  }
  
  const handlePressOut = () => {
    if (screen === 'web') {
      console.log('Web: handlePressOut - Cleaning up timers');
      clearTimeout(webDelayTimer.current);
      clearTimeout(webAnimationTimer.current);
      webDelayTimer.current = undefined;
      webAnimationTimer.current = undefined;

      if (!isDeleting.value) {
        cancelAnimation(scale);
        cancelAnimation(progress);
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        progress.value = withTiming(0, { duration: 200 });
      }
    }
  }

  const content = (
    <Animated.View style={animatedStyle}>
      <Animated.View style={[deleteIndicatorStyle, { zIndex: overlayZIndex }]} />
      <Animated.View style={[dimOverlayStyle, { zIndex: overlayZIndex }]} />
      <View style={{ zIndex: contentZIndex, margin: 0, padding: 0 }}>{children}</View>
      <Animated.View style={[deleteTextStyle, { zIndex: textZIndex }]}>
        <XStack gap="$2" ai="center" justifyContent="center">
          <Ionicons name="trash-outline" size={16} color="#ff3b30" />
          <Text color="#ff3b30" fontSize={12} fontWeight="500">Delete</Text>
        </XStack>
      </Animated.View>
      <Animated.View style={[progressStyle, { zIndex: progressZIndex, borderRadius: 2 }]}>
        <LinearGradient
          colors={['#CC0000', '#FF6666', '#FFCCCC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { margin: 0, padding: 0, borderRadius: 2 }]}
        />
      </Animated.View>
    </Animated.View>
  );
  
  return screen === 'web'
    ? <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={isDeleting.value}>{content}</Pressable>
    : <GestureDetector gesture={longPressGesture}><Pressable disabled={isDeleting.value}>{content}</Pressable></GestureDetector>
}