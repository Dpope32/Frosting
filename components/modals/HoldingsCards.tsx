import React from 'react'
import { useColorScheme, StyleSheet, Platform } from 'react-native'
import { YStack, Text, XStack, ScrollView, Button, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { portfolioData } from '@/utils/Portfolio'
import { usePortfolioStore } from '@/store'
import { getStockValueColor } from '@/utils/styleUtils'
import Animated, { FadeIn } from 'react-native-reanimated'

interface HoldingsCardsProps {
  closePortfolioModal: () => void
  openEditStockModal: (stock?: any) => void
}

export function HoldingsCards({ closePortfolioModal, openEditStockModal }: HoldingsCardsProps) {
  const { prices, historicalData } = usePortfolioStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  
  
  const iconButtonStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? 'rgba(41, 41, 41, 0.5)' : 'rgba(231, 231, 231, 0.8)',
      borderRadius: 12,
      paddingVertical: Platform.OS === 'web' ? 8 : 10,
      paddingHorizontal: Platform.OS === 'web' ? 10 : 4,
      borderWidth: 1,
      borderColor: isDark ? '#111' : 'rgba(0, 0, 0, 0.1)',
    },
  })
  
  const calculateReturn = (currentPrice: number, historicalPrice: number | null | undefined) => {
    if (!historicalPrice || historicalPrice === 0) return '-'
    const returnPercentage = ((currentPrice - historicalPrice) / historicalPrice) * 100
    return `${returnPercentage.toFixed(0)}%`
  }

  return (
    <YStack>
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$3">
        <Text color={isDark ? '#999' : '#666'} fontFamily="$body" fontSize={14}>
          Holdings
        </Text>
        <Button
          backgroundColor="transparent"
          onPress={() => {
            closePortfolioModal()
            setTimeout(() => {
              openEditStockModal(undefined)
            }, 100)
          }}
          padding="$1"
          pressStyle={{ opacity: 0.7 }}
          icon={<MaterialIcons name="add" size={24} color={isDark ? '#f9f9f9' : '#000'} />}
        />
      </XStack>
      <ScrollView
        maxHeight={isWeb ? 600 : '100%'}
        bounces={true}
        showsVerticalScrollIndicator={false}
        style={{ flexGrow: 0 }}
      >
        <YStack
          gap={isWeb ? "$3" : "$3"}
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
            portfolioData.map((stock, index) => {
              const currentPrice = prices[stock.symbol] || 0
              const totalValue = currentPrice * stock.quantity
              const stockHistoricalData = historicalData?.[stock.symbol]
              return (
                <Animated.View
                  key={stock.symbol}
                  entering={FadeIn.delay(index * 50)}
                  style={[styles.card, isWeb && { width: '48%' }]}
                >
                  <YStack paddingHorizontal="$3" >
                    <XStack justifyContent="space-between" alignItems="center" height={isWeb ? undefined : 30}>
                      <XStack alignItems="center" gap="$2" flex={1}>
                        <YStack>
                          {isWeb ? (
                            <XStack alignItems="center" gap="$2">
                              <Text color={isDark ? '#fff' : '#000'} fontSize={16} fontWeight="500" fontFamily="$body">
                                {stock.symbol}
                              </Text>
                              <Text color={isDark ? '#999' : '#666'} fontSize={14} fontFamily="$body">
                                {stock.name}
                              </Text>
                              <Text color={isDark ? '#666' : '#333'} fontSize={14} fontFamily="$body">
                                {stock.quantity} shares
                              </Text>
                            </XStack>
                          ) : (
                            <YStack>
                              <XStack alignItems="center" gap="$3">
                                <Text color={isDark ? '#f3f3f3' : '#000'} fontSize={isWeb ? 18 : 16} fontWeight="500" fontFamily="$heading">
                                  {stock.symbol}
                                </Text>
                                <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 16 : 16} fontFamily="$body">
                                  {stock.name}
                                </Text>
                                <Text color={isDark ? '#666' : '#333'} fontSize={isWeb ? 14 : 12} fontFamily="$body" mt="$0.5">
                                  x{stock.quantity}
                                </Text>
                              </XStack>
                            </YStack>
                          )}
                        </YStack>
                      </XStack>
                      <XStack alignItems="center" gap="$2">
                        <Text color={getStockValueColor(currentPrice, isDark)} fontSize={15} fontWeight="500" fontFamily="$heading">
                          ${currentPrice.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                        <Button
                          icon={<MaterialIcons name="edit" size={16} color={isDark ? '#777777' : '#000'} />}
                          circular
                          {...iconButtonStyle}
                          pressStyle={{ opacity: 0.7 }}
                          backgroundColor="transparent"
                          marginRight={-16}
                          onPress={() => {
                            closePortfolioModal()
                            setTimeout(() => {
                              openEditStockModal(stock)
                            }, 100)
                          }}
                        />
                      </XStack>
                    </XStack>
                    <XStack
                      justifyContent="flex-start"
                      br={8}
                      alignItems="flex-start"
                      height={isWeb ? 35 : 20}
                      paddingLeft="$1"
                    >
                      <XStack alignItems="center" flex={1} gap="$2">
                        <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 14 : 12} fontWeight="500" fontFamily="$body">
                          1D
                        </Text>
                        <Text
                          color={ stockHistoricalData?.['1d'] ? getStockValueColor(currentPrice - (stockHistoricalData['1d'] || 0), isDark) : isDark ? '#777' : '#999' }
                          fontSize={isWeb ? 14 : 12}
                          fontWeight="600"
                          fontFamily="$body"
                        >
                          {stockHistoricalData?.['1d'] ? calculateReturn(currentPrice, stockHistoricalData['1d']) : '-'}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" flex={1} gap="$1.5">
                        <Text color={isDark ? '#999' : '#666'} fontSize={14} fontWeight="500" fontFamily="$body">
                          1W
                        </Text>
                        <Text
                          color={ stockHistoricalData?.['1w'] ? getStockValueColor(currentPrice - (stockHistoricalData['1w'] || 0), isDark)  : isDark  ? '#777' : '#999' }
                          fontSize={isWeb ? 14 : 12}
                          fontWeight="600"
                          fontFamily="$body"
                        >
                          {stockHistoricalData?.['1w'] ? calculateReturn(currentPrice, stockHistoricalData['1w']) : '-'}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" flex={1} gap="$1.5">
                        <Text color={isDark ? '#999' : '#666'} fontSize={14} fontWeight="500" fontFamily="$body">
                          3M
                        </Text>
                        <Text
                       color={stockHistoricalData?.['3m']  ? getStockValueColor(currentPrice - (stockHistoricalData['3m'] || 0), isDark) : isDark ? '#777' : '#999' }
                          fontSize={14}
                          fontWeight="600"
                          fontFamily="$body"
                        >
                          {stockHistoricalData?.['3m'] ? calculateReturn(currentPrice, stockHistoricalData['3m']) : '-'}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" flex={1} gap="$1.5">
                        <Text color={isDark ? '#999' : '#666'} fontSize={14} fontWeight="500" fontFamily="$body">
                          1Y
                        </Text>
                        <Text
                          color={ stockHistoricalData?.['1y'] ? getStockValueColor(currentPrice - (stockHistoricalData['1y'] || 0), isDark) : isDark ? '#777' : '#999' }
                          fontSize={isWeb ? 14 : 12}
                          fontWeight="600"
                          fontFamily="$body"
                        >
                          {stockHistoricalData?.['1y'] ? calculateReturn(currentPrice, stockHistoricalData['1y']) : '-'}
                        </Text>
                      </XStack>
                    </XStack>
                  </YStack>
                </Animated.View>
              )
            })
          )}
        </YStack>
      </ScrollView>
    </YStack>
  )
} 