import React, { useEffect } from 'react'
import { YStack, Text, GetThemeValueForKey, useMedia, isWeb } from 'tamagui'
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
  left: width * 0.1,
  right: width * 0.1,
  alignItems: 'center'
}

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <YStack
      position="absolute"
      {...toastStyle}
      gap="$1"
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
  const media = useMedia()
  const isWeb = media.gtMd // Use gtMd or similar breakpoint for web-like sizes

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
        paddingHorizontal: isWeb ? 24 : 10, 
        paddingVertical: 12,
        minWidth: isWeb ? 500 : 350, 
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        overflow: 'hidden',
        backgroundColor: "rgba(159, 159, 159, 0.13)",
      }}
    >
      <Text flexWrap='nowrap' color="$color.gray1" fontSize={isWeb ? '$6' : '$4'} fontFamily="$body"> 
        {message}
      </Text>
      {type === 'success' && ( 
        <Ionicons name="checkmark-circle" size={isWeb ? 24 : 20} color="#22c55e" />
      )}
      {type === 'error' && (
        <Ionicons name="alert-circle" size={isWeb ? 24 : 20} color="#ef4444" />
      )}
      {type === 'info' && (
        <Ionicons name="information-circle" size={isWeb ? 24 : 20} color="#3b82f6" />
      )}
      {type === 'warning' && (
        <Ionicons name="warning" size={isWeb ? 24 : 20} color="#f59e0b" />
      )}
    </BlurView>
  )
}
