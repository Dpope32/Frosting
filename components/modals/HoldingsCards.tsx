import React, { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, XStack, ScrollView, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { portfolioData, isIpad } from '@/utils'
import { Pressable } from 'react-native'
import { Stock } from '@/types'
import { IndividualCard } from './individualCard'
import { usePortfolioStore, useUserStore } from '@/store'

interface HoldingsCardsProps {
  openEditStockModal: (stock: Stock) => void
  openAddStockModal: () => void
}

export function HoldingsCards({ openEditStockModal, openAddStockModal }: HoldingsCardsProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { holdings, syncHoldingsWithPortfolioData, isSyncEnabled } = usePortfolioStore()
  const isPremium = useUserStore((state) => state.preferences.premium)

  // Only use store holdings for premium users with sync enabled, otherwise use portfolioData
  const shouldUseStoreHoldings = isPremium && isSyncEnabled
  const displayHoldings = shouldUseStoreHoldings ? holdings : portfolioData

  // Sync holdings with portfolioData on mount (only for premium users with sync enabled)
  useEffect(() => {
    if (shouldUseStoreHoldings && holdings.length === 0 && portfolioData.length > 0) {
      syncHoldingsWithPortfolioData()
    }
  }, [holdings.length, syncHoldingsWithPortfolioData, shouldUseStoreHoldings])

  return (
    <YStack>
      <ScrollView
        maxHeight={isWeb ? 600 : '100%'}
        bounces={true}
        showsVerticalScrollIndicator={false}
        style={{ flexGrow: 0 }}
      >
        <YStack
          gap={isWeb ? "$2" : "$2.5"}
          pt={isIpad() ? '$2' : '$1'}
          paddingBottom={isWeb ? '$4' : '$2'}
          flexDirection={isWeb ? 'row' : 'column'}
          flexWrap={isWeb ? 'wrap' : 'nowrap'}
          justifyContent={isWeb ? 'space-between' : 'center'}
          px={isWeb ? '$2' : '$1'}
        >
          {displayHoldings.length === 0 ? (
            <YStack
              height={120}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDark ? 'rgba(0, 0, 0, 0.8)' : '#ffffff'}
              br={16}
              padding="$5"
              borderWidth={isDark ? 1 : 0}
              borderColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}
              shadowColor={isDark ? 'transparent' : '#000000'}
              shadowOffset={{ width: 0, height: 2 }}
              shadowOpacity={isDark ? 0 : 0.08}
              shadowRadius={isDark ? 0 : 8}
              elevation={isDark ? 0 : 2}
            >
              <Text color={isDark ? '#999' : '#1a202c'} fontSize={16} fontFamily="$body" fontWeight="600">
                No stocks added yet
              </Text>
              <Text color={isDark ? '#666' : '#4a5568'} fontSize={14} fontFamily="$body" mt="$1">
                Tap + to add your first stock
              </Text>
            </YStack>
          ) : (
            displayHoldings.map((stock, index) => (
              <IndividualCard
                key={stock.symbol}
                stock={stock}
                index={index}
                isDark={isDark}
                openEditStockModal={openEditStockModal}
              />
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
} 