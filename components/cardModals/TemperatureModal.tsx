import React from 'react'
import { YStack, Text } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'

interface TemperatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  temperature?: string
}

export function TemperatureModal({ open, onOpenChange, temperature }: TemperatureModalProps) {
  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Temperature Details"
    >
      <YStack gap="$4">
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Current Temperature</Text>
          <Text color="#a0a0a0" fontSize={32} marginTop="$2">
            {temperature || 'N/A'}
          </Text>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Forecast</Text>
          <Text color="#a0a0a0" fontSize={14} marginTop="$2">
            Coming soon...
          </Text>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
