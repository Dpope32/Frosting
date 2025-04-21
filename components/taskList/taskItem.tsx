import React, { useRef } from 'react'
import { Pressable, View } from 'react-native'
import { Task, RecurrencePattern } from '@/types/task'
import { XStack, YStack, Text, isWeb } from 'tamagui'
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
import { useColorScheme, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getCategoryColor, getRecurrenceColor, getRecurrenceIcon, getPriorityColor, getPriorityIonIcon } from '@/utils/styleUtils'

interface TaskCardItemProps {
  task: Task
  onLongPress: (task: Task) => void
  onPressEdit: (task: Task) => void
}

export const TaskItem: React.FC<TaskCardItemProps> = ({ task, onLongPress, onPressEdit }) => {
  const isDark = useColorScheme() === 'dark'
  const scale = useSharedValue(1)
  const progress = useSharedValue(0)
  const isDeleting = useSharedValue(false)
  const screen = Platform.OS
  const LONG_PRESS_DURATION = 800 // 0.8 seconds

  const handleHapticFeedback = () => {
    if (screen !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  const handleReadyHaptic = () => {
    if (screen !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  const handleNotificationFeedback = () => {
    if (screen !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  const triggerDeleteAction = () => {
    if (!isDeleting.value) {
      isDeleting.value = true;
      handleNotificationFeedback();
      onLongPress(task);
    }
  };

  const longPressGesture = Gesture.LongPress()
    .minDuration(50)
    .onBegin(() => {
      'worklet';
      isDeleting.value = false;
      runOnJS(handleHapticFeedback)();
      scale.value = withSpring(1.02, { damping: 15, stiffness: 100 });
      progress.value = withTiming(1, { 
        duration: LONG_PRESS_DURATION,
        easing: Easing.linear 
      }, (finished) => {
        if (finished) {
          runOnJS(handleReadyHaptic)();
          // Automatically trigger delete when progress completes
          runOnJS(triggerDeleteAction)();
        }
      });
    })
    .onFinalize(() => {
      'worklet';
      // Only reset visuals if we're not deleting
      if (!isDeleting.value) {
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
        progress.value = withTiming(0, { duration: 200 });
      }
    })
    .onTouchesMove(() => {
      'worklet';
      // Only cancel if not already deleting
      if (!isDeleting.value) {
        cancelAnimation(progress);
        progress.value = withTiming(0, { duration: 200 });
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: scale.value }] 
  }));

  const progressStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: `${progress.value * 100}%`,
    backgroundColor: '#ff3b30',
    borderRadius: 2,
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
  }));

  const deleteTextStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    right: 16,
    opacity: progress.value,
  }));

  const pattern: RecurrencePattern = task.category === 'bills'
    ? 'monthly'
    : (task.recurrencePattern || 'one-time') as RecurrencePattern
  const recColor = getRecurrenceColor(pattern)
  const recIcon = getRecurrenceIcon(pattern)
  const priColor = task.priority ? getPriorityColor(task.priority) : null
  const priIcon = task.priority ? getPriorityIonIcon(task.priority) : null

  const content = (
    <XStack 
      bg={isDark ? '$gray2' : '$gray3'} 
      br={8} 
      p={isWeb ? "$4" : "$3"} 
      mb={isWeb ? "$3" : "$2"} 
      py={isWeb ? "$4" : "$3"} 
      px={isWeb ? "$4" : "$3"}
      alignItems="center" 
      justifyContent="space-between"
      width="100%"
      position="relative"
      overflow="hidden"
    >
      <Animated.View style={deleteIndicatorStyle} />
      <YStack flex={1}>
        <Text fontSize={isWeb ? 15 : 16} fontWeight="500" fontFamily="$body" color={isDark ? '$gray12' : '$gray11'}>{task.name}</Text>
        <XStack flexWrap="wrap" py={isWeb ? "$2" : "$1.5"} mt="$1">
          {task.category && task.category !== 'bills' && (
            <XStack ai="center" bg={`${getCategoryColor(task.category)}1A`} px={isWeb ? "$2" : "$2"} py="$1" br={12} mr="$2">
              <Ionicons name="bookmark" size={isWeb ? 11 : 12} color={getCategoryColor(task.category)} />
              <Text ml="$1" fontFamily="$body" fontSize={isWeb ? 11 : 12} color={getCategoryColor(task.category)}>{task.category}</Text>
            </XStack>
          )}
          {task.priority && (
            <XStack ai="center" bg={`${priColor}1A`} px={isWeb ? "$2" : "$2"} py="$1" br={12} mr="$2">
              <Ionicons name={priIcon!} size={isWeb ? 11 : 12} color={priColor!} />
              <Text ml="$1" fontFamily="$body" fontSize={isWeb ? 11 : 12} color={priColor!}>{task.priority}</Text>
            </XStack>
          )}
          <XStack ai="center" bg={`${recColor}1A`} px={isWeb ? "$2" : "$2"} py="$1" br={12} mr="$2">
            <Ionicons name={recIcon as any} size={isWeb ? 11 : 12} color={recColor} />
            <Text ml="$1" fontFamily="$body" fontSize={isWeb ? 11 : 12} color={recColor}>{pattern}</Text>
          </XStack>
        </XStack>
      </YStack>
      <Pressable onPress={() => onPressEdit(task)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        <Ionicons name="pencil-outline" size={isWeb ? 16 : 18} color={isDark ? '#888' : '$gray10'} />
      </Pressable>
      <Animated.View style={deleteTextStyle}>
        <XStack gap="$2" ai="center">
          <Ionicons name="trash-outline" size={16} color="#ff3b30" />
          <Text color="#ff3b30" fontSize={12} fontWeight="500">Hold to Delete</Text>
        </XStack>
      </Animated.View>
      <Animated.View style={progressStyle} />
    </XStack>
  );

  const webTimer = useRef<NodeJS.Timeout>()
  
  const handlePressIn = () => {
    if (screen === 'web') webTimer.current = setTimeout(() => onLongPress(task), 500)
  }
  
  const handlePressOut = () => {
    if (screen === 'web') clearTimeout(webTimer.current)
  }

  return screen === 'web'
    ? <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>{content}</Pressable>
    : <GestureDetector gesture={longPressGesture}><Animated.View style={animatedStyle}>{content}</Animated.View></GestureDetector>
}