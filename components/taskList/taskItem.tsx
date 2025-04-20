import React, { useRef } from 'react'
import { Pressable } from 'react-native'
import { Task, RecurrencePattern } from '@/types/task'
import { XStack, YStack, Text, isWeb } from 'tamagui'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
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
  const screen = Platform.OS

  const longPress = Gesture.LongPress()
    .minDuration(1000)
    .onStart(() => {
      if (screen !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      scale.value = withTiming(1.05, { duration: 150 })
    })
    .onEnd((_e, success) => {
      if (success) {
        if (screen !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        onLongPress(task)
      } else {
        scale.value = withTiming(1, { duration: 150 })
      }
    })
    .onFinalize((_e, success) => {
      if (!success) scale.value = withTiming(1, { duration: 150 })
    })

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const webTimer = useRef<NodeJS.Timeout>()
  const handlePressIn = () => {
    if (screen === 'web') webTimer.current = setTimeout(() => onLongPress(task), 500)
  }
  const handlePressOut = () => {
    if (screen === 'web') clearTimeout(webTimer.current)
  }

  const pattern: RecurrencePattern = task.category === 'bills'
    ? 'monthly'
    : (task.recurrencePattern || 'one-time') as RecurrencePattern
  const recColor = getRecurrenceColor(pattern)
  const recIcon = getRecurrenceIcon(pattern)
  const priColor = task.priority ? getPriorityColor(task.priority) : null
  const priIcon = task.priority ? getPriorityIonIcon(task.priority) : null

  const content = (
    <XStack bg={isDark ? '$gray2' : '$gray3'} br={8} p={isWeb ? "$4" : "$3"} mb={isWeb ? "$3" : "$2"} py={isWeb ? "$4" : "$2"} alignItems="center" justifyContent="space-between">
      <YStack flex={1}>
        <Text fontSize={15} fontWeight="500" fontFamily="$body" color={isDark ? '$gray12' : '$gray11'}>{task.name}</Text>
        <XStack flexWrap="wrap" py={isWeb ? "$2" : "$1"} mt="$1">
          {task.category && task.category !== 'bills' && (
            <XStack ai="center" bg={`${getCategoryColor(task.category)}1A`} px={isWeb ? "$2" : "$1.5"} py="$0.5" br={12} mr="$2">
              <Ionicons name="bookmark" size={11} color={getCategoryColor(task.category)} />
              <Text ml="$1" fontFamily="$body" fontSize={11} color={getCategoryColor(task.category)}>{task.category}</Text>
            </XStack>
          )}
          {task.priority && (
            <XStack ai="center" bg={`${priColor}1A`} px={isWeb ? "$2" : "$1.5"} py="$0.5" br={12} mr="$2">
              <Ionicons name={priIcon!} size={11} color={priColor!} />
              <Text py={isWeb ? "$2" : "$1"} px={isWeb ? "$2" : "$1"} ml="$1" fontFamily="$body" fontSize={11} color={priColor!}>{task.priority}</Text>
            </XStack>
          )}
          <XStack ai="center" bg={`${recColor}1A`} px={isWeb ? "$2" : "$1.5"} py="$0.5" br={12} mr="$2">
            <Ionicons name={recIcon as any} size={11} color={recColor} />
            <Text py={isWeb ? "$2" : "$1"} px={isWeb ? "$2" : "$1"} ml="$1" fontFamily="$body" fontSize={11} color={recColor}>{pattern}</Text>
          </XStack>
        </XStack>
      </YStack>
      <Pressable onPress={() => onPressEdit(task)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        <Ionicons name="pencil-outline" size={16} color={isDark ? '#888' : '$gray10'} />
      </Pressable>
    </XStack>
  )

  return screen === 'web'
    ? <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>{content}</Pressable>
    : <GestureDetector gesture={longPress}><Animated.View style={animatedStyle}>{content}</Animated.View></GestureDetector>
}
