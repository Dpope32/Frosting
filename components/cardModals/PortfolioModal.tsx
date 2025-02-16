import React, { useState } from 'react'
import { YStack, Text, XStack, ScrollView, Button } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { BaseCardModal } from './BaseCardModal'
import { usePortfolioStore } from '@/store/PortfolioStore'
import { portfolioData } from '@/utils/Portfolio'
import { Stock } from '@/types'
import { useUserStore } from '@/store/UserStore'
import { EditStockModal } from './EditStockModal'
import { getValueColor } from '@/constants/valueHelper'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PortfolioModal({ open, onOpenChange }: PortfolioModalProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>()
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const { prices, totalValue } = usePortfolioStore()

  const iconButtonStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  }

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio"
    >
      <YStack gap="$4" paddingTop="$2">
        {/* Current Value Section */}
        <YStack>
          <Text color="#999" fontSize={14} marginBottom="$2">Current Value</Text>
          <YStack
            backgroundColor="rgba(0, 0, 0, 0.6)"
            borderRadius={12}
            padding="$4"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <Text 
              color={getValueColor('portfolio', totalValue || 0, '')} 
              fontSize={24} 
              fontWeight="600"
            >
              ${(totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </YStack>
        </YStack>

        {/* Holdings Section */}
        <YStack>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
            <Text color="#999" fontSize={14}>Holdings</Text>
            <Button
              icon={<MaterialIcons name="add" size={20} color="#fff" />}
              circular
              {...iconButtonStyle}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                setSelectedStock(undefined)
                setEditModalOpen(true)
              }}
            />
          </XStack>

          <ScrollView 
            maxHeight={400} 
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <YStack gap="$2">
              {portfolioData.length === 0 ? (
                <YStack 
                  height={100} 
                  alignItems="center" 
                  justifyContent="center"
                  backgroundColor="rgba(0, 0, 0, 0.6)"
                  borderRadius={12}
                  borderWidth={1}
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  <Text color="#999" fontSize={14}>No stocks added yet</Text>
                  <Text color="#666" fontSize={12}>Tap + to add your first stock</Text>
                </YStack>
              ) : (
                portfolioData.map((stock) => {
                  const currentPrice = prices[stock.symbol] || 0
                  const totalValue = currentPrice * stock.quantity
                  
                  return (
                    <YStack 
                      key={stock.symbol}
                      backgroundColor="rgba(0, 0, 0, 0.6)"
                      borderRadius={12}
                      padding="$4"
                      borderWidth={1}
                      borderColor="rgba(255, 255, 255, 0.1)"
                      pressStyle={{ opacity: 0.8 }}
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack flex={1}>
                          <XStack alignItems="center" gap="$2">
                            <Text color="#fff" fontSize={16} fontWeight="500">{stock.symbol}</Text>
                            <Text color="#999" fontSize={12}>{stock.quantity} shares</Text>
                          </XStack>
                          <Text color="#999" fontSize={12}>{stock.name}</Text>
                        </YStack>

                        <YStack alignItems="flex-end" flex={1}>
                          <Text color="#fff" fontSize={16} fontWeight="500">
                            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Text>
                          <Text color="#999" fontSize={12}>
                            ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / share
                          </Text>
                        </YStack>

                        <Button
                          icon={<MaterialIcons name="edit" size={16} color="#fff" />}
                          circular
                          {...iconButtonStyle}
                          marginLeft="$3"
                          pressStyle={{ opacity: 0.7 }}
                          onPress={() => {
                            setSelectedStock(stock)
                            setEditModalOpen(true)
                          }}
                        />
                      </XStack>
                    </YStack>
                  )
                })
              )}
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