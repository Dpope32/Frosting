//@ts-nocheck
import React from 'react'
import { Pressable, View, Switch } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
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

  return (
    <YStack space={isIpad() ? '$2' : '$1'} pl={6} mt="$2" pb="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15}>
          Notify at task time
        </Text>
        <Switch
          value={notifyOnTime}
          onValueChange={onNotifyOnTimeChange}
          trackColor={{ false: '#767577', true: primaryColor }}
          thumbColor="#f4f3f4"
        />
      </XStack>

      <XStack alignItems="center" justifyContent="space-between">
        <Text fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15}>
          Notify before task
        </Text>
        <Switch
          value={notifyBefore}
          onValueChange={onNotifyBeforeChange}
          trackColor={{ false: '#767577', true: primaryColor }}
          thumbColor="#f4f3f4"
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
  )
} 