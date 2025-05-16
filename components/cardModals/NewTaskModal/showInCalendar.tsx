import React  from 'react'
import { Pressable, View } from 'react-native'
import { XStack, Text  } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { isIpad } from '@/utils'

interface ShowInCalendarProps {
  showInCalendar: boolean
  onShowInCalendarChange: (showInCalendar: boolean) => void
  isDark: boolean
}

export function ShowInCalendar({ showInCalendar, onShowInCalendarChange, isDark }: ShowInCalendarProps) {
        
  return (
    <XStack alignItems="center" ml={4} justifyContent="space-between" paddingHorizontal="$2.5" marginTop="$1.5">
      <Text fontFamily="$body" color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15} flexWrap="nowrap">
        Add an Event to Calendar?
      </Text>
      <Pressable onPress={() => onShowInCalendarChange(!showInCalendar)}
        style={{ 
          paddingHorizontal: 2, 
          paddingVertical: 2, 
          backgroundColor: showInCalendar ? (isDark ? '#1a1a1a' : '#f0f0f0') : 'transparent',
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
          borderColor: showInCalendar ? '#00C851' : '#bbb',
          backgroundColor: showInCalendar 
            ? (isDark ? '#181f1b' : '#b6f2d3') 
            : (isDark ? '#232323' : '#f7f7f7'),
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        }}>
          {showInCalendar && (
            <Ionicons name="checkmark-sharp" size={15} color="#00C851" />
          )}
        </View>
      </Pressable>
    </XStack>
  )
}