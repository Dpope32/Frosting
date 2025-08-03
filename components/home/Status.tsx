import React from 'react'
import { Platform } from 'react-native'
import { YStack, Text } from 'tamagui'
import Animated, { SlideInDown } from 'react-native-reanimated'

interface ConnectionDetails {
  type?: string
  isConnected?: boolean
  details?: {
    isConnectionExpensive?: boolean
  }
}

const shouldDisplayField = (value: any): boolean => {
  return value !== undefined && value !== null && value !== ''
}

export const Status = ({ 
  status, 
  isDark, 
  showLoading 
}: { 
  status: string; 
  isDark: boolean; 
  showLoading: boolean 
}): JSX.Element => {
  const details: ConnectionDetails = {
    type: 'Network',
    isConnected: status.includes('Connected') || status.includes('Online'),
    details: {
      isConnectionExpensive: status.includes('Metered') || status.includes('Expensive')
    }
  }

  return (
    <Animated.View entering={SlideInDown.duration(500).delay(300)}>
      <YStack
        backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
        br={12}
        padding="$4"
        borderWidth={1}
        borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)"}
      >
        <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontFamily="$body" fontWeight="500">
          Connection Status
        </Text>
        <YStack gap="$2" mt="$2">
          {shouldDisplayField(details?.type) && (
            <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
              Type: {details?.type}
            </Text>
          )}
          <Text
            fontFamily="$body"
            color={details?.isConnected ? (isDark ? "#22c55e" : "#16a34a") : (isDark ? "#ef4444" : "#dc2626")}
            fontSize={14}
            fontWeight="500"
          >
            Status: {showLoading ? 'Checking...' : details?.isConnected ? 'Connected' : 'Disconnected'}
          </Text>
          {shouldDisplayField(details?.details?.isConnectionExpensive !== undefined) && (
            <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
              Data Usage: {details?.details?.isConnectionExpensive ? 'Metered' : 'Unmetered'}
            </Text>
          )}
          {Platform.OS === 'web' && (
            <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
              Platform: Web
            </Text>
          )}
          {__DEV__ && (
            <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
              Environment: Development
            </Text>
          )}
        </YStack>
      </YStack>
    </Animated.View>
  )
}