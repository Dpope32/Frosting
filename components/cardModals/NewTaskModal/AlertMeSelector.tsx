//@ts-nocheck
import React from 'react'
import { Pressable, View } from 'react-native'
import { XStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { isIpad } from '@/utils'
import { Bell } from '@tamagui/lucide-icons'

interface AlertMeSelectorProps {
  alertMe: boolean
  onAlertMeChange: (value: boolean) => void
  isDark: boolean
}

export function AlertMeSelector({ 
  alertMe, 
  onAlertMeChange, 
  isDark 
}: AlertMeSelectorProps) {
  return (
    <XStack alignItems="center" ml={4} justifyContent="space-between" paddingHorizontal="$2.5" marginTop="$1.5">
      <XStack alignItems="center" gap="$2">
        <Bell size={isIpad() ? 18 : 15} color={isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'} />
        <Text fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} flexWrap="nowrap">
          Alert me
        </Text>
      </XStack>
      <Pressable onPress={() => onAlertMeChange(!alertMe)}
        style={{ 
          paddingHorizontal: 2, 
          paddingVertical: 2, 
          backgroundColor: alertMe ? (isDark ? '#1a1a1a' : '#f0f0f0') : 'transparent',
          borderRadius: 8,
        }}
      >
        <View style={{
          width: 22,
          height: 22,
          borderWidth: 1.5,
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: alertMe ? '#00C851' : '#bbb',
          backgroundColor: alertMe 
            ? (isDark ? '#181f1b' : '#b6f2d3') 
            : (isDark ? '#232323' : '#f7f7f7'),
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        }}>
          {alertMe && (
            <Ionicons name="checkmark-sharp" size={15} color="#00C851" />
          )}
        </View>
      </Pressable>
    </XStack>
  )
} 