import React from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

export const Pills = () => {
    return (
        <XStack gap="$6" alignItems="center" justifyContent="center" paddingVertical="$4">
        <YStack alignItems="center" gap="$2">
          <YStack width={30} height={30} backgroundColor="transparent" borderRadius={20} alignItems="center" justifyContent="center">
            <Ionicons name="checkmark" size={20} color="rgb(3, 250, 114)" />
          </YStack>
          <Text fontSize="$3" color="$color11" fontFamily="$body" textAlign="center">Open Source</Text>
        </YStack>
        
        <YStack alignItems="center" gap="$2">
          <YStack width={30} height={30} backgroundColor="transparent" borderRadius={20} alignItems="center" justifyContent="center">
            <Ionicons name="shield-checkmark" size={20} color="rgb(19, 3, 250)" />
          </YStack>
          <Text fontSize="$3" color="$color11" fontFamily="$body" textAlign="center">End-to-End Encrypted</Text>
        </YStack>
        
        <YStack alignItems="center" gap="$2">
          <YStack width={30} height={30} backgroundColor="transparent" borderRadius={20} alignItems="center" justifyContent="center">
            <Ionicons name="home" size={20} color="rgb(3, 250, 114)" />
          </YStack>
          <Text fontSize="$3" color="$color11" fontFamily="$body" textAlign="center">Local First</Text>
        </YStack>

        <YStack alignItems="center" gap="$2">
          <YStack width={30} height={30} backgroundColor="transparent" borderRadius={20} alignItems="center" justifyContent="center">
            <Ionicons name="server-outline" size={20} color="rgb(3, 110, 250)" />
          </YStack>
          <Text fontSize="$3" color="$color11" fontFamily="$body" textAlign="center">Docker (Coming Soon)</Text>
        </YStack>

      </XStack>
    )
}