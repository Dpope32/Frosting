import React from 'react'
import { YStack, Text, XStack, ScrollView } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { usePortfolioStore } from '../../store/PortfolioStore'
import { portfolioData } from '../../utils/Portfolio'

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
            ${(usePortfolioStore.getState().totalValue || 0).toFixed(2)}
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
          <ScrollView maxHeight={200} marginTop="$2">
            <YStack gap="$2">
              {portfolioData.map((stock) => {
                const currentPrice = usePortfolioStore.getState().prices[stock.symbol] || 0
                const totalValue = currentPrice * stock.quantity
                
                return (
                  <YStack 
                    key={stock.symbol}
                    backgroundColor="rgba(35,35,35,0.8)"
                    borderRadius={8}
                    padding="$3"
                  >
                    <XStack justifyContent="space-between">
                      <YStack>
                        <Text color="#fff" fontSize={16} fontWeight="500">{stock.symbol}</Text>
                        <Text color="#a0a0a0" fontSize={12}>{stock.name}</Text>
                      </YStack>
                      <YStack alignItems="flex-end">
                        <Text color="#fff" fontSize={16}>${totalValue.toFixed(2)}</Text>
                        <Text color="#a0a0a0" fontSize={12}>{stock.quantity} shares @ ${currentPrice.toFixed(2)}</Text>
                      </YStack>
                    </XStack>
                  </YStack>
                )
              })}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
