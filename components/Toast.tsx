import React, { useEffect, useRef } from 'react'
import { YStack, Text, XStack } from 'tamagui'
import { Animated, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToastStore } from '@/store/ToastStore'

const { height } = Dimensions.get('window')

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <YStack
      position="absolute"
      top={height * 0.1}
      left={16}
      right={16}
      gap="$2"
      zIndex={100000}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </YStack>
  )
}

interface ToastItemProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  onRemove: (id: string) => void
}

function ToastItem({ id, message, type, onRemove }: ToastItemProps) {
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => onRemove(id))
    }, 2700)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <XStack
        backgroundColor="rgba(45,45,45,0.95)"
        borderRadius={8}
        paddingHorizontal="$4"
        paddingVertical="$3"
        alignItems="center"
        justifyContent="space-between"
        elevation={5}
        shadowColor="black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={8}
      >
        <Text color="#fff" fontSize={16}>
          {message}
        </Text>
        {type === 'success' && (
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
        )}
        {type === 'error' && (
          <Ionicons name="alert-circle" size={24} color="#ef4444" />
        )}
        {type === 'info' && (
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
        )}
      </XStack>
    </Animated.View>
  )
}
