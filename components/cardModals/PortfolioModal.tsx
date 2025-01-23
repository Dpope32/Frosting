import React, { useState } from 'react'
import { YStack, Text, XStack, ScrollView, Button } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { BaseCardModal } from './BaseCardModal'
import { usePortfolioStore } from '../../store/PortfolioStore'
import { portfolioData } from '../../utils/Portfolio'
import { EditStockModal } from './EditStockModal'
import { Stock } from '@/types'
import { useUserStore } from '../../store/UserStore'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value?: string
  change?: string
  changePercentage?: string
}

export function PortfolioModal({ open, onOpenChange, value, change, changePercentage }: PortfolioModalProps) {
  const isPositive = change && !change.startsWith('-')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>()
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  
  const iconButtonStyle = {
    backgroundColor: `${primaryColor}20`,
    borderColor: `${primaryColor}60`,
    borderWidth: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: 40,
    height: 40,
    marginLeft: 10,
  }
  
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
          flex={1}
        >
          <XStack justifyContent="space-between" alignItems="center">
            <Text color="#fff" fontSize={16} fontWeight="500">Holdings</Text>
            <Button
              icon={<MaterialIcons name="add" size={24} color={primaryColor} />}
              size="$3"
              circular
              {...iconButtonStyle}
              pressStyle={{ opacity: 0.8 }}
              onPress={() => {
                setSelectedStock(undefined)
                setEditModalOpen(true)
              }}
            />
          </XStack>
          <ScrollView marginTop="$2" maxHeight={400} bounces={false}>
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
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack flex={1}>
                        <Text color="#fff" fontSize={16} fontWeight="500">{stock.symbol}</Text>
                        <Text color="#a0a0a0" fontSize={12}>{stock.name}</Text>
                      </YStack>
                      <YStack alignItems="flex-end" flex={1}>
                        <Text color="#fff" fontSize={16}>${totalValue.toFixed(2)}</Text>
                        <Text color="#a0a0a0" fontSize={12}>{stock.quantity} shares @ ${currentPrice.toFixed(2)}</Text>
                      </YStack>
                      <Button
                        icon={<MaterialIcons name="edit" size={24} color={primaryColor} />}
                        size="$3"
                        circular
                        {...iconButtonStyle}
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => {
                          setSelectedStock(stock)
                          setEditModalOpen(true)
                        }}
                        marginLeft="$2"
                      />
                    </XStack>
                  </YStack>
                )
              })}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
      <EditStockModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        stock={selectedStock}
      />
    </BaseCardModal>
  )
}