import React from 'react'
import { View, Platform, Pressable, StyleSheet } from 'react-native'
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
  
  const delayBeforeFeedback = 500;
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
      handleNotificationFeedback();
      onDelete((deleted: boolean) => {
        if (!deleted) {
          scale.value = withSpring(1, { damping: 15, stiffness: 100 });
          progress.value = withTiming(0, { duration: 200 });
          isDeleting.value = false;
        }
      });
    }
  }, [onDelete, handleNotificationFeedback, isDeleting, scale, progress]);
  
  // Animation timers
  const animationTimer = React.useRef<NodeJS.Timeout>();
  const delayTimer = React.useRef<NodeJS.Timeout>();
  
  const startDeleteAnimation = () => {
    console.log('Starting delete animation');
    isDeleting.value = false;
    
    // Start the progress animation
    progress.value = withTiming(1, {
      duration: animationDuration,
      easing: Easing.linear
    }, (finished) => {
      if (finished && progress.value === 1) {
        handleReadyHaptic();
        triggerDeleteAction();
      }
    });
    
    // Start the scale animation with a slight delay
    scale.value = withDelay(100, withSpring(1.02, { damping: 15, stiffness: 100 }));
  };
  
  const cancelDeleteAnimation = () => {
    console.log('Cancelling delete animation');
    clearTimeout(delayTimer.current);
    clearTimeout(animationTimer.current);
    
    if (!isDeleting.value) {
      cancelAnimation(scale);
      cancelAnimation(progress);
      scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      progress.value = withTiming(0, { duration: 200 });
    }
  };
  
  const handlePressIn = () => {
    console.log('Press in - starting delay timer');
    // Start delay timer
    delayTimer.current = setTimeout(() => {
      startDeleteAnimation();
    }, delayBeforeFeedback);
  };
  
  const handlePressOut = () => {
    console.log('Press out - cancelling');
    cancelDeleteAnimation();
  };
  
  const handleLongPress = () => {
    // This shouldn't be called since we handle timing manually,
    // but it's here as a fallback
    console.log('Long press detected (fallback)');
    if (!isDeleting.value && progress.value < 0.1) {
      startDeleteAnimation();
    }
  };
    
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    position: 'relative',
  }));
  
  const progressStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 0,
    left: 5,
    right: 0,
    height: 2,
    width: `${progress.value * 97}%`,
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

  const contentZIndex = 10; 
  const overlayZIndex = 3;
  const textZIndex = 4;
  const progressZIndex = 1;

  return (
    <Pressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      delayLongPress={delayBeforeFeedback + animationDuration} 
      disabled={isDeleting.value}
      style={{ flex: 1 }}
    >
      <Animated.View style={animatedStyle}>
        <Animated.View style={[deleteIndicatorStyle, { zIndex: overlayZIndex }]} />
        <Animated.View style={[dimOverlayStyle, { zIndex: overlayZIndex }]} />
        
        <View 
          style={{ zIndex: contentZIndex, margin: 0, padding: 0 }}
          pointerEvents="box-none" 
        >
          {children}
        </View>
        
        <Animated.View style={[deleteTextStyle, { zIndex: textZIndex }]} pointerEvents="none">
          <XStack gap="$2" ai="center" justifyContent="center">
            <Ionicons name="trash-outline" size={16} color="#ff3b30" />
            <Text color="#ff3b30" fontSize={12} fontWeight="500">Delete</Text>
          </XStack>
        </Animated.View>
        
        <Animated.View style={[progressStyle, { zIndex: progressZIndex, borderRadius: 2 }]} pointerEvents="none">
          <LinearGradient
            colors={['#CC0000', '#FF6666', '#FFCCCC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { margin: 0, padding: 0, borderRadius: 2 }]}
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}