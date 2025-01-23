import React from 'react'
import { YStack, Text, XStack } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string
  change?: string
  changePercentage?: string
}

export function PortfolioModal({ open, onOpenChange, value, change, changePercentage }: PortfolioModalProps) {
  const isPositive = change && !change.startsWith('-')
  
  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio Details"
    >
      <YStack gap="$4">
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Current Value</Text>
          <Text color="#a0a0a0" fontSize={32} marginTop="$2">
            {value || '$0.00'}
          </Text>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Today's Change</Text>
          <XStack gap="$2" marginTop="$2">
            <Text 
              color={isPositive ? "#4CAF50" : "#FF5252"} 
              fontSize={20}
            >
              {change || '$0.00'}
            </Text>
            {changePercentage && (
              <Text 
                color={isPositive ? "#4CAF50" : "#FF5252"} 
                fontSize={20}
              >
                ({changePercentage})
              </Text>
            )}
          </XStack>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Holdings</Text>
          <Text color="#a0a0a0" fontSize={14} marginTop="$2">
            Coming soon...
          </Text>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
