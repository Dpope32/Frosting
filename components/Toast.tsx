import React, { useEffect } from 'react'
import { YStack, Text, XStack, GetThemeValueForKey } from 'tamagui'
import { Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useToastStore } from '@/store/ToastStore'

const { height, width } = Dimensions.get('window')

const toastStyle: {
  top: number;
  left: number;
  right: number;
  alignItems: 'center';
} = {
  top: height * 0.15,
  left: width * 0.15,
  right: width * 0.15,
  alignItems: 'center'
}

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <YStack
      position="absolute"
      {...toastStyle}
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
  onRemove: (id: string) => void
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  message,
  type,
  fontFamily,
  duration,
  onRemove
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
        onRemove(id)
    }, duration)
    return () => clearTimeout(timer)
  }, [])

  return (
    <BlurView
      intensity={50}
      tint="dark"
      style={{
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
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
    </BlurView>
  )
}
