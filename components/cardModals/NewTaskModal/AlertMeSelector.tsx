//@ts-nocheck
import React, { useState, useEffect } from 'react'
import { Pressable, View, Switch, Platform } from 'react-native'
import { XStack, YStack, Text, isWeb } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { isIpad } from '@/utils'
import { NOTIFICATION_TIME_OPTIONS } from '@/constants'

interface AlertMeSelectorProps {
  notifyOnTime: boolean
  onNotifyOnTimeChange: (value: boolean) => void
  notifyBefore: boolean
  onNotifyBeforeChange: (value: boolean) => void
  notifyBeforeTime: string
  onNotifyBeforeTimeChange: (value: string) => void
  isDark: boolean
  primaryColor: string
  showTimeOptions: boolean
  setShowTimeOptions: (show: boolean) => void
}

export function AlertMeSelector({
  notifyOnTime,
  onNotifyOnTimeChange,
  notifyBefore,
  onNotifyBeforeChange,
  notifyBeforeTime,
  onNotifyBeforeTimeChange,
  isDark,
  primaryColor,
  showTimeOptions,
  setShowTimeOptions
}: AlertMeSelectorProps) {
  const textColor = isDark ? '#ffffff' : '#000000'
  const isMobile = !isWeb && !isIpad()
  
  // Set switch sizes based on platform
  const thumbSize = isMobile ? 14 : 16
  const trackSize = isMobile ? 14 : 16
  
  // State for main notification toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  
  // Update main toggle when either notification option changes
  useEffect(() => {
    setNotificationsEnabled(notifyOnTime || notifyBefore)
  }, [notifyOnTime, notifyBefore])
  
  // Handle main toggle changes
  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value)
    
    // If turning off notifications, disable both options
    if (!value) {
      onNotifyOnTimeChange(false)
      onNotifyBeforeChange(false)
    }
    
    // If turning on notifications, enable at least one option
    if (value && !notifyOnTime && !notifyBefore) {
      onNotifyOnTimeChange(true)
    }
  }

  return (
    <YStack gap={isWeb ? 24 : isIpad() ? '$2' : '$1'} pl={isWeb ? 6 : isIpad() ? 12 : 8} mt={isWeb ? 8 : "$1"} pb="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontWeight="600" fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isWeb ? 15 : isIpad() ? 17 : 15}>
          Notifications
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={handleNotificationsToggle}
          trackColor={{ false: '#767577', true: primaryColor }}
          thumbColor="#f4f3f4"
          thumbSize={thumbSize}
          trackSize={trackSize}
          style={Platform.OS === 'ios' && isMobile ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
        />
      </XStack>

      {notificationsEnabled && (
        <YStack pl="$2" mt="$1.5" gap={isWeb ? 16 : "$1.5"}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontWeight="600" fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isWeb ? 15 : isIpad() ? 17 : 15}>
              Notify at time
            </Text>
            <Switch
              value={notifyOnTime}
              onValueChange={onNotifyOnTimeChange}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor="#f4f3f4"
              thumbSize={thumbSize}
              trackSize={trackSize}
              style={Platform.OS === 'ios' && isMobile ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
            />
          </XStack>

          <XStack alignItems="center" justifyContent="space-between">
            <Text fontWeight="600" fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isWeb ? 15 : isIpad() ? 17 : 15}>
              Notify before
            </Text>
            <Switch
              value={notifyBefore}
              onValueChange={onNotifyBeforeChange}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor="#f4f3f4"
              thumbSize={thumbSize}
              trackSize={trackSize}
              style={Platform.OS === 'ios' && isMobile ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : undefined}
            />
          </XStack>

          {notifyBefore && (
            <XStack alignItems="center" justifyContent="flex-start" mt="$1">
              <Pressable onPress={() => setShowTimeOptions(!showTimeOptions)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text color={textColor} fontSize={isIpad() ? 17 : 15} mr={4}>
                  {NOTIFICATION_TIME_OPTIONS.find(opt => opt.value === notifyBeforeTime)?.label || 'Select time'}
                </Text>
                <Ionicons name={showTimeOptions ? 'chevron-up' : 'chevron-down'} size={18} color={textColor} />
              </Pressable>
            </XStack>
          )}

          {showTimeOptions && (
            <YStack bg={isDark ? '#222222' : '#ffffff'} borderColor={isDark ? '#444444' : '#dddddd'} borderWidth={1} borderRadius={8} mt="$1" mb="$3" maxHeight={isIpad() ? 200 : 150}
              overflow="auto"
            >
              {NOTIFICATION_TIME_OPTIONS.map(opt => (
                <Pressable
                  key={opt.value}
                  onPress={() => { onNotifyBeforeTimeChange(opt.value); setShowTimeOptions(false) }}
                  style={{ padding: 8, backgroundColor: opt.value === notifyBeforeTime ? primaryColor : 'transparent' }}
                >
                  <Text color={opt.value === notifyBeforeTime ? '#ffffff' : textColor} fontSize={isIpad() ? 17 : 15}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </YStack>
          )}
        </YStack>
      )}
    </YStack>
  )
} 