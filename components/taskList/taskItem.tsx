import React, { useRef } from 'react'
import { Pressable, View, Platform } from 'react-native'
import { Task, RecurrencePattern } from '@/types'
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
import { Ionicons } from '@expo/vector-icons'
import { getCategoryColor, getRecurrenceColor, getRecurrenceIcon, getPriorityColor, getPriorityIonIcon, isIpad } from '@/utils'
import { useCustomCategoryStore, useUserStore } from '@/store'
import { useColorScheme } from '@/hooks'

interface TaskCardItemProps {
  task: Task
  onLongPress: (task: Task, onComplete: (deleted: boolean) => void) => void
  onPressEdit: (task: Task) => void
}

export const TaskItem: React.FC<TaskCardItemProps> = ({ task, onLongPress, onPressEdit }) => {
  const isDark = useColorScheme() === 'dark'
  const scale = useSharedValue(1)
  const progress = useSharedValue(0)
  const isDeleting = useSharedValue(false)
  const screen = Platform.OS
  const LONG_PRESS_DURATION = 1000
  const customCategories = useCustomCategoryStore((s) => s.categories)
  const userColor = useUserStore(s => s.preferences.primaryColor)
  const isCustom = task.category && customCategories.some(catObj => catObj.name === task.category)

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
      runOnJS(handleNotificationFeedback)();
      runOnJS(onLongPress)(task, (deleted: boolean) => {
        'worklet';
      });
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
          runOnJS(triggerDeleteAction)();
        }
      });
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

  const pattern: RecurrencePattern = task.category === 'bills' ? 'monthly' : (task.recurrencePattern || 'one-time') as RecurrencePattern
  const recColor = getRecurrenceColor(pattern)
  const recIcon = getRecurrenceIcon(pattern)
  const priColor = task.priority ? getPriorityColor(task.priority) : null
  const priIcon = task.priority ? getPriorityIonIcon(task.priority) : null

  const handleEditPress = (e: any) => {
    e?.stopPropagation?.();
    onPressEdit(task);
    return false;
  };

  const mainContent = (
    <XStack
      bg={isDark ? '#1e1e1e' : '$gray2'}
      br={8}
      p={isWeb ? "$4" : isIpad() ? "$3" : "$2"}
      pt={isWeb ? "$3" : "$3"}
      pb={isWeb ? "$2" : "$2"}
      px={isWeb ? "$4" : "$3"}
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      position="relative"
      overflow="hidden"
      borderWidth={1}
      borderColor={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
      shadowColor="transparent"
      shadowOffset={{ width: 0, height: 0 }}
      shadowOpacity={0}
      shadowRadius={0}
      elevation={0}
    >
      <Animated.View style={deleteIndicatorStyle} />
      <YStack flex={1}>
        <Text fontSize={isWeb ? 15 : 16} fontWeight="500" fontFamily="$body" color={isDark ? '$gray12' : '$gray11'}>{task.name}</Text>
        <XStack flexWrap="wrap" py={isWeb ? "$2" : "$1.5"} mt={isWeb ? "$1" : "$1"}>
          {task.category && task.category !== 'bills' && (
            <XStack ai="center" bg={isCustom ? `${userColor}15` : `${getCategoryColor(task.category)}1A`} px={isWeb ? "$2" : "$2"} py="$1" br={12} mr="$2">
              {!isCustom && (
                <Ionicons name="bookmark" size={isWeb ? 11 : 12} color={getCategoryColor(task.category)} />
              )}
              <Text ml="$1" fontFamily="$body" fontSize={isWeb ? 11 : 12} color={isCustom ? "$gray11" : getCategoryColor(task.category)}>{task.category}</Text>
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

      <Animated.View style={deleteTextStyle}>
        <XStack gap="$2" ai="center">
          <Ionicons name="trash-outline" size={16} color="#ff3b30" />
          <Text color="#ff3b30" fontSize={12} fontWeight="500" fontFamily="$body">Delete</Text>
        </XStack>
      </Animated.View>
      <Animated.View style={progressStyle} />
    </XStack>
  );

  const editButton = (
    <Pressable
      onPress={handleEditPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.7 : 1,
        padding: 8,
        marginRight: 4
      })}
    >
      <Ionicons name="pencil-outline" size={isWeb ? 16 : 18} color={isDark ? '#888' : '$gray10'} />
    </Pressable>
  );

  const webTimer = useRef<NodeJS.Timeout>()

  const handlePressIn = () => {
    if (screen === 'web') {
      webTimer.current = setTimeout(() => {
        isDeleting.value = true;
        onLongPress(task, (deleted) => {
          if (!deleted) {
            scale.value = withSpring(1, { damping: 15, stiffness: 100 });
            progress.value = withTiming(0, { duration: 200 });
            isDeleting.value = false;
          }
        });
      }, 500);
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

  if (screen === 'web') {
    return (
      <XStack width="100%" position="relative">
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={{ flex: 1 }}>
          {mainContent}
        </Pressable>
        <View style={{ position: 'absolute', right: 8, top: 0, bottom: 0, justifyContent: 'center' }}>
          {editButton}
        </View>
      </XStack>
    );
  }

  return (
    <XStack width="100%" position="relative">
      <View style={{ flex: 1 }}>
        <GestureDetector gesture={longPressGesture}>
          <Animated.View style={animatedStyle}>{mainContent}</Animated.View>
        </GestureDetector>
      </View>
      <View style={{ position: 'absolute', right: 8, top: 0, bottom: 0, justifyContent: 'center' }}>
        {editButton}
      </View>
    </XStack>
  );
}
