import React, { useEffect, useRef } from 'react'
import { YStack, Text, XStack, GetThemeValueForKey } from 'tamagui'
import { Animated, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useToastStore } from '@/store/ToastStore'

const { height } = Dimensions.get('window')

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <YStack
      position="absolute"
      bottom={height * 0.1}
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
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
  fontFamily: GetThemeValueForKey<'fontFamily'>
  position: string
  createdAt: number
  onRemove: (id: string) => void
}

function ToastItem({ id, message, type, fontFamily, duration, onRemove }: ToastItemProps) {
  // Temporary removal for diagnostics
  useEffect(() => {
    const timer = setTimeout(() => {
        onRemove(id)
    }, duration) // Use the passed duration
    return () => clearTimeout(timer)
  }, [])

  return (
    <XStack
      backgroundColor="rgba(45,45,45,0.95)"
      br={8}
      px="$4"
      py="$3"
      alignItems="center"
      justifyContent="space-between"
      elevation={5}
      shadowColor="black"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.25}
      shadowRadius={8}
    >
      <Text color="#fff" fontSize={16} fontFamily={fontFamily}>
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
      {type === 'warning' && (
        <Ionicons name="warning" size={24} color="#f59e0b" />
      )}
    </XStack>
  )
}
