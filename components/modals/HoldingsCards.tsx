import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, XStack, ScrollView, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { portfolioData, isIpad } from '@/utils'
import { Pressable } from 'react-native'
import { Stock } from '@/types'
import { IndividualCard } from './individualCard'

interface HoldingsCardsProps {
  closePortfolioModal: () => void
  openEditStockModal: (stock: Stock) => void
  openAddStockModal: () => void
}

export function HoldingsCards({ closePortfolioModal, openEditStockModal, openAddStockModal }: HoldingsCardsProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <YStack>
      <XStack pb={isIpad() ? '$2' : '$1'} justifyContent="space-between" alignItems="center" paddingHorizontal="$3">
        <Text color={isDark ? '#999' : '#666'} fontFamily="$body" fontSize={14}>
          Holdings
        </Text>
        <Pressable 
          onPress={openAddStockModal}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialIcons name="add" size={24} color={isDark ? '#f9f9f9' : '#000'} />
        </Pressable>
      </XStack>
      <ScrollView
        maxHeight={isWeb ? 600 : '100%'}
        bounces={true}
        showsVerticalScrollIndicator={false}
        style={{ flexGrow: 0 }}
      >
        <YStack
          gap={isWeb ? "$3" : "$3"}
          pt={isIpad() ? '$2' : '$1'}
          paddingBottom={isWeb ? '$4' : '$2'}
          flexDirection={isWeb ? 'row' : 'column'}
          flexWrap={isWeb ? 'wrap' : 'nowrap'}
          justifyContent={isWeb ? 'space-between' : 'flex-start'}
        >
          {portfolioData.length === 0 ? (
            <YStack
              height={100}
              alignItems="center"
              justifyContent="center"
              backgroundColor={isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              br={12}
              padding="$4"
              borderWidth={1}
              borderColor={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}
            >
              <Text color={isDark ? '#999' : '#666'} fontSize={14} fontFamily="$body">
                No stocks added yet
              </Text>
              <Text color={isDark ? '#666' : '#999'} fontSize={14} fontFamily="$body">
                Tap + to add your first stock
              </Text>
            </YStack>
          ) : (
            portfolioData.map((stock, index) => (
              <IndividualCard
                key={stock.symbol}
                stock={stock}
                index={index}
                isDark={isDark}
                closePortfolioModal={closePortfolioModal}
                openEditStockModal={openEditStockModal}
              />
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
} 