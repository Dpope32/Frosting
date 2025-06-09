import React from 'react'
import { useColorScheme, StyleSheet, Platform } from 'react-native'
import { YStack, Text, XStack, Button, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { getStockValueColor, isIpad } from '@/utils'
import { usePortfolioStore } from '@/store'
import Animated, { FadeIn } from 'react-native-reanimated'
import { Stock } from '@/types'

interface IndividualCardProps {
  stock: Stock
  index: number
  isDark: boolean
  openEditStockModal: (stock: Stock) => void
}

export function IndividualCard({ 
  stock, 
  index, 
  isDark, 
  openEditStockModal 
}: IndividualCardProps) {
  const { prices, historicalData } = usePortfolioStore()
  
  const currentPrice = prices[stock.symbol] || 0
  const stockHistoricalData = historicalData?.[stock.symbol]
  
  const iconButtonStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(71, 85, 105, 0.08)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? 'rgba(41, 41, 41, 0.5)' : '#ffffff',
      borderRadius: 16,
      paddingVertical: Platform.OS === 'web' ? 10 : 8,
      paddingHorizontal: Platform.OS === 'web' ? 12 : 12,
      borderWidth: isDark ? 1 : 1,
      borderColor: isDark ? '#111' : '#ccc',
      shadowColor: isDark ? 'transparent' : '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: isDark ? 0 : 0.1,
      shadowRadius: isDark ? 0 : 8,
      elevation: isDark ? 0 : 3,
    },
  })
  
  const calculateReturn = (currentPrice: number, historicalPrice: number | null | undefined) => {
    if (!historicalPrice || historicalPrice === 0) return '-'
    const returnPercentage = ((currentPrice - historicalPrice) / historicalPrice) * 100
    return `${returnPercentage.toFixed(0)}%`
  }

  return (
    <Animated.View
      key={stock.symbol}
      entering={FadeIn.delay(index * 50)}
      style={[styles.card, isWeb && { width: '48%' }]}
    >
      <YStack paddingHorizontal="$2" >
        <XStack justifyContent="space-between" alignItems="center" height={isWeb ? undefined : 26}>
          <XStack alignItems="center" gap="$2" flex={1}>
            <YStack>
              {isWeb ? (
                <XStack alignItems="center" gap="$2">
                  <Text color={isDark ? '#fff' : '#1a202c'} fontSize={16} fontWeight="600" fontFamily="$heading">
                    {stock.symbol}
                  </Text>
                  <Text color={isDark ? '#999' : '#2d3748'} fontSize={14} fontFamily="$body" fontWeight="500">
                    {stock.name}
                  </Text>
                  <Text color={isDark ? '#666' : '#4a5568'} fontSize={14} fontFamily="$body">
                    {stock.quantity} shares
                  </Text>
                </XStack>
              ) : (
                <YStack>
                  <XStack alignItems="center" gap="$3">
                    <Text color={isDark ? '#f3f3f3' : '#1a202c'} fontSize={isWeb ? 18 : 16} fontWeight="600" fontFamily="$heading">
                      {stock.symbol}
                    </Text>
                    <Text color={isDark ? '#999' : '#2d3748'} fontSize={isWeb ? 16 : 16} fontFamily="$body" fontWeight="500">
                      {stock.name}
                    </Text>
                    <Text color={isDark ? '#666' : '#4a5568'} fontSize={isWeb ? 14 : 12} fontFamily="$body" mt="$0.5">
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
              icon={<MaterialIcons name="edit" size={16} color={isDark ? '#777777' : '#2d3748'} />}
              circular
              {...iconButtonStyle}
              pressStyle={{ opacity: 0.7 }}
              backgroundColor="transparent"
              marginRight={-16}
              onPress={() => {
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
          height={isWeb ? 28 : 18}
          paddingLeft="$1"
        >
          <XStack alignItems="center" flex={1} gap="$2">
            <Text color={isDark ? '#999' : '#2d3748'} fontSize={isWeb ? 14 : 12} fontWeight="600" fontFamily="$body">
              1D
            </Text>
            <Text
              color={ stockHistoricalData?.['1d'] ? getStockValueColor(currentPrice - (stockHistoricalData['1d'] || 0), isDark) : isDark ? '#777' : '#4a5568' }
              fontSize={isWeb ? 14 : 12}
              fontWeight="600"
              fontFamily="$body"
            >
              {stockHistoricalData?.['1d'] ? calculateReturn(currentPrice, stockHistoricalData['1d']) : '-'}
            </Text>
          </XStack>
          <XStack alignItems="center" flex={1} gap="$1.5">
            <Text color={isDark ? '#999' : '#2d3748'} fontSize={14} fontWeight="600" fontFamily="$body">
              1W
            </Text>
            <Text
              color={ stockHistoricalData?.['1w'] ? getStockValueColor(currentPrice - (stockHistoricalData['1w'] || 0), isDark)  : isDark  ? '#777' : '#4a5568' }
              fontSize={isWeb ? 14 : 12}
              fontWeight="600"
              fontFamily="$body"
            >
              {stockHistoricalData?.['1w'] ? calculateReturn(currentPrice, stockHistoricalData['1w']) : '-'}
            </Text>
          </XStack>
          <XStack alignItems="center" flex={1} gap="$1.5">
            <Text color={isDark ? '#999' : '#2d3748'} fontSize={14} fontWeight="600" fontFamily="$body">
              3M
            </Text>
            <Text
           color={stockHistoricalData?.['3m']  ? getStockValueColor(currentPrice - (stockHistoricalData['3m'] || 0), isDark) : isDark ? '#777' : '#4a5568' }
              fontSize={14}
              fontWeight="600"
              fontFamily="$body"
            >
              {stockHistoricalData?.['3m'] ? calculateReturn(currentPrice, stockHistoricalData['3m']) : '-'}
            </Text>
          </XStack>
          <XStack alignItems="center" flex={1} gap="$1.5">
            <Text color={isDark ? '#999' : '#2d3748'} fontSize={14} fontWeight="600" fontFamily="$body">
              1Y
            </Text>
            <Text
              color={ stockHistoricalData?.['1y'] ? getStockValueColor(currentPrice - (stockHistoricalData['1y'] || 0), isDark) : isDark ? '#777' : '#4a5568' }
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
}
             