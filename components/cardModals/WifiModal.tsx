import React from 'react'
import { YStack, Text } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'

interface WifiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  speed?: string
}

export function WifiModal({ open, onOpenChange, speed }: WifiModalProps) {
  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Network Details"
    >
      <YStack gap="$4">
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Current Speed</Text>
          <Text color="#a0a0a0" fontSize={32} marginTop="$2">
            {speed || 'N/A'}
          </Text>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Network Status</Text>
          <Text color="#a0a0a0" fontSize={14} marginTop="$2">
            Connected
          </Text>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Network Type</Text>
          <Text color="#a0a0a0" fontSize={14} marginTop="$2">
            WiFi
          </Text>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
