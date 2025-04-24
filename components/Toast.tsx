// toast.tsx

import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions } from 'react-native'
import { YStack, Text, GetThemeValueForKey, useMedia } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useToastStore } from '@/store/ToastStore'
import { isIpad } from '@/utils/deviceUtils'
const { height, width } = Dimensions.get('window')

const toastStyle = {
  position: 'absolute' as const,
  top: height * 0.12,
  left: 0,
  right: 0,
  alignItems: 'center' as const,
  zIndex: 100000,
  pointerEvents: 'box-none' as const,
}

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  return (
    <YStack {...toastStyle} gap="$2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </YStack>
  )
}

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItemProps {
  id: string
  message: string
  type: ToastType
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
  onRemove,
}) => {
  const media = useMedia()
  const isLarge = media.gtMd
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration - 600),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onRemove(id)
      }
    })
  }, [fadeAnim, duration, id, onRemove])

  const colorMap: Record<ToastType, string> = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b',
  }

  const backgroundMap: Record<ToastType, string> = {
    success: 'rgba(34, 197, 94, 0.07)',
    error: 'rgba(239,68,68,0.15)',
    info: 'rgba(59,130,246,0.15)',
    warning: 'rgba(245,158,11,0.15)',
  }

  const iconMap: Record<ToastType, any> = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
    warning: 'warning',
  }
   
  const borderColorMap: Record<ToastType, string> = {
    success: 'rgba(34,197,94,0.15)',
    error: 'rgba(239,68,68,0.15)',
    info: 'rgba(59,130,246,0.15)',
    warning: 'rgba(245,158,11,0.15)',
  }

  const iconColor = colorMap[type]
  const textColor = colorMap[type]
  const backgroundColor = backgroundMap[type]
  const iconName = iconMap[type]

  return (
    // @ts-ignore
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
        alignSelf: 'center',
        marginLeft: isIpad() ? 100 : 0,
      }}
    >
      <BlurView
        intensity={70}
        tint="dark"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: isLarge ? 14 : 12,
          paddingVertical: isLarge ? 14 : 12,  
          backgroundColor,
          borderRadius: 8,
          borderBlockColor: borderColorMap[type],
          borderWidth: 3,
          borderColor: borderColorMap[type],
        }}
      >
        <Ionicons
          name={iconName}
          size={isLarge ? 24 : 20}
          color={iconColor}
          style={{ marginRight: 8 }}
        />
        <Text
          color={textColor}
          fontSize={isLarge ? '$4' : 16}
          fontFamily={fontFamily}
          numberOfLines={1}
          fontWeight="500"
          ellipsizeMode="tail"
        >
          {message}
        </Text>
      </BlurView>
    </Animated.View>
  )
}
