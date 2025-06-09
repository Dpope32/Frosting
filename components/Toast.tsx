// toast.tsx

import React, { useEffect, useRef } from 'react'
import { Animated, Dimensions } from 'react-native'
import { YStack, Text, GetThemeValueForKey, useMedia, isWeb } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { useToastStore } from '@/store'
import { isIpad } from '@/utils'
import { useColorScheme } from '@/hooks/useColorScheme'
const { height, width } = Dimensions.get('window')

const toastStyle = {
  position: 'absolute' as const,
  top: height * 0.085,
  left: 0,
  right: 0,
  alignItems: 'center' as const,
  zIndex: 100000,
  pointerEvents: 'box-none' as const,
}

export const Toast = React.memo(() => {
  const { toasts, removeToast } = useToastStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <YStack {...toastStyle} gap="$2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={removeToast} isDark={isDark} />
      ))}
    </YStack>
  )
})

Toast.displayName = 'Toast'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItemProps {
  id: string
  message: string
  type: ToastType
  duration: number
  fontFamily: GetThemeValueForKey<'fontFamily'>
  onRemove: (id: string) => void
  isDark?: boolean
}

const ToastItem: React.FC<ToastItemProps> = React.memo(({
  id,
  message,
  type,
  fontFamily,
  duration,
  onRemove,
  isDark,
}) => {
  const media = useMedia()
  const isLarge = media.gtMd
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: !isWeb   
      }),
      Animated.delay(duration - 600),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: !isWeb
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onRemove(id)
      }
    })
  }, [fadeAnim, duration, id, onRemove])

  const colorMap: Record<ToastType, string> = React.useMemo(() => ({
    success: isDark ? '#22c55e' : 'rrgba(6, 136, 39, 0.86)',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b',
  }), [])

  const backgroundMap: Record<ToastType, string> = React.useMemo(() => ({
    success: isDark ? 'rgba(6, 26, 15, 0.95)' : 'rgba(174, 219, 191, 0.52)',
    error: isDark ? 'rgba(18,18,20,0.95)' : 'rgba(239,68,68,0.15)',
    info: isDark ? 'rgba(18,18,20,0.95)' : 'rgba(59,130,246,0.15)',
    warning: isDark ? 'rgba(18,18,20,0.95)' : 'rgba(245,158,11,0.15)',
  }), [isDark])

  const iconMap: Record<ToastType, any> = React.useMemo(() => ({
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
    warning: 'warning',
  }), [])
   
  const borderColorMap: Record<ToastType, string> = React.useMemo(() => ({
    success: isDark ? 'rgba(34,197,94,0.3)' : 'rgba(190, 255, 214, 0.86)',
    error: isDark ? 'rgba(239,68,68,0.07)' : 'rgba(239,68,68,0.15)',
    info: isDark ? 'rgba(59,130,246,0.07)' : 'rgba(59,130,246,0.15)',
    warning: isDark ? 'rgba(245,158,11,0.07)' : 'rgba(245,158,11,0.15)',
  }), [isDark])

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
        marginLeft: isWeb ? 150 : isIpad() ? 120 : 0,
      }}
    >
      <BlurView
        intensity={isDark ? 50 : 20}
        tint={isDark ? 'dark' : 'light'}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: isLarge ? 14 : 12,
          paddingVertical: isLarge ? 14 : 12,  
          backgroundColor: backgroundColor,
          borderRadius: 14,
          overflow: 'hidden',
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
})

ToastItem.displayName = 'ToastItem'
