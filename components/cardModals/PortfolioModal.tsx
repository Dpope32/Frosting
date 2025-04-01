import React, { useState, useEffect } from 'react'
import { useColorScheme, StyleSheet, Platform, Alert } from 'react-native'
import { YStack, Text, XStack, ScrollView, Button, Input, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { BaseCardModal } from './BaseCardModal'
import { usePortfolioStore, updatePrincipal, removeFromPortfolio } from '@/store/PortfolioStore'
import { portfolioData } from '@/utils/Portfolio'
import { useEditStockStore } from '@/store/EditStockStore'
import { getValueColor } from '@/constants/valueHelper'
import Animated, { FadeIn } from 'react-native-reanimated'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  return debouncedValue
}

export function PortfolioModal({ open, onOpenChange }: PortfolioModalProps) {
  const { prices, totalValue, principal, historicalData } = usePortfolioStore()
  const currentTotalValue = totalValue ?? 0
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false)
  const [principalInput, setPrincipalInput] = useState(principal.toString())
  const debouncedPrincipalInput = useDebounce(principalInput, 300)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  useEffect(() => {
    if (isEditingPrincipal) {
      const newValue = parseFloat(debouncedPrincipalInput)
      if (!isNaN(newValue) && newValue >= 0) {
        updatePrincipal(newValue)
      }
    }
  }, [debouncedPrincipalInput, isEditingPrincipal])
  const openEditStockModal = useEditStockStore(s => s.openModal)
  const closePortfolioModal = () => onOpenChange(false)
  const getStockValueColor = (value: number): string => {
    const color = getValueColor('portfolio', value, '')
    if (!isDark) {
      if (color === '#22c55e') return '#15803d'
      if (color === '#ef4444') return '#b91c1c'
    }
    return color
  }
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
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      borderRadius: 12,
      padding: Platform.OS === 'web' ? 10 : 8,
      borderWidth: 1.5,
      borderColor: isDark ? '#223' : 'rgba(0, 0, 0, 0.1)',
    },
  })
  const calculateROI = () => {
    if (!principal || principal === 0) return 0
    return ((currentTotalValue - principal) / principal) * 100
  }
  const roi = calculateROI()
  const calculateReturn = (currentPrice: number, historicalPrice: number | null | undefined) => {
    if (!historicalPrice || historicalPrice === 0) return '-'
    const returnPercentage = ((currentPrice - historicalPrice) / historicalPrice) * 100
    return `${returnPercentage.toFixed(1)}%`
  }
  const webCardStyle = isWeb
    ? {
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: isDark ? '#444' : '#ccc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        backgroundColor: isDark ? '#1e1e2f' : '#f0f0f0',
        backgroundImage: isDark
          ? 'linear-gradient(135deg,rgb(34, 34, 34),rgb(0, 0, 0))'
          : 'linear-gradient(135deg, #ffffff, #eeeeee)',
      }
    : {}
  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio"
      snapPoints={Platform.OS === 'web' ? [85] : [80]}
      showCloseButton={true}
    >
      <YStack
        gap={Platform.OS === 'web' ? '$2' : '$3'}
        paddingTop={Platform.OS === 'web' ? 0 : '$1'}
        paddingBottom={Platform.OS === 'web' ? '$5' : '$2'}
      >
        <YStack>
          <Animated.View entering={FadeIn.duration(600)} style={[styles.card, webCardStyle]}>
            <YStack gap={isWeb ? '$4' : '$2'} px="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 16 : 14} fontFamily="$body">
                  Value
                </Text>
                <Text
                  color={getStockValueColor(currentTotalValue)}
                  fontSize={isWeb ? 18 : 14}
                  fontWeight="600"
                  fontFamily="$body"
                >
                  ${currentTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 16 : 14} fontFamily="$body">
                  Principal
                </Text>
                {isEditingPrincipal ? (
                  <Input
                    value={principalInput}
                    onChangeText={(v) => setPrincipalInput(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    autoFocus
                    onBlur={() => {
                      setIsEditingPrincipal(false)
                    }}
                    backgroundColor="$backgroundHover"
                    borderColor="$borderColor"
                    height={24}
                    textAlign="right"
                    fontSize={isWeb ? 16 : 14}
                    width={isWeb ? 140 : 110}
                    fontFamily="$body"
                  />
                ) : (
                  <Text
                    fontSize={isWeb ? 18 : 14}
                    fontWeight="600"
                    color={isDark ? '#aaa' : '#b91c1c'}
                    onPress={() => {
                      setIsEditingPrincipal(true)
                      setPrincipalInput(principal.toString())
                    }}
                    fontFamily="$body"
                  >
                    -${principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                )}
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 16 : 14} fontFamily="$body">
                  P/L
                </Text>
                <Text
                  color={getStockValueColor(currentTotalValue - principal)}
                  fontSize={isWeb ? 18 : 14}
                  fontWeight="600"
                  fontFamily="$body"
                >
                  ${(currentTotalValue - principal).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </XStack>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 14 : 12} fontFamily="$body">
                  ROI
                </Text>
                <Text
                  color={getStockValueColor(roi)}
                  fontSize={isWeb ? 18 : 14}
                  fontWeight="600"
                  fontFamily="$body"
                >
                  {roi.toFixed(1)}%
                </Text>
              </XStack>
            </YStack>
          </Animated.View>
        </YStack>
        <YStack>
          <XStack justifyContent="space-between" alignItems="center" paddingRight="$1">
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
              icon={<MaterialIcons name="add" size={24} color={isDark ? '#fff' : '#000'} />}
            />
          </XStack>
          <ScrollView
            maxHeight={Platform.OS === 'web' ? 600 : '100%'}
            bounces={true}
            showsVerticalScrollIndicator={false}
            style={{ flexGrow: 0 }}
          >
            <YStack
              gap="$2"
              paddingBottom={Platform.OS === 'web' ? '$4' : '$2'}
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
                      <YStack gap="$2">
                        <XStack justifyContent="space-between" alignItems="center">
                          <XStack alignItems="center" gap="$2" flex={1}>
                            <Button
                              icon={<MaterialIcons name="edit" size={16} color={isDark ? '#fff' : '#000'} />}
                              circular
                              {...iconButtonStyle}
                              pressStyle={{ opacity: 0.7 }}
                              backgroundColor="transparent"
                              onPress={() => {
                                closePortfolioModal()
                                setTimeout(() => {
                                  openEditStockModal(stock)
                                }, 100)
                              }}
                            />
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
                                  <XStack alignItems="center" gap="$2">
                                    <Text color={isDark ? '#fff' : '#000'} fontSize={16} fontWeight="500" fontFamily="$body">
                                      {stock.symbol}
                                    </Text>
                                    <Text color={isDark ? '#999' : '#666'} fontSize={14} fontFamily="$body">
                                      {stock.name}
                                    </Text>
                                  </XStack>
                                  <Text color={isDark ? '#666' : '#333'} fontSize={13} fontFamily="$body" mt="$0.5">
                                    {stock.quantity} shares
                                  </Text>
                                </YStack>
                              )}
                            </YStack>
                          </XStack>
                          <YStack alignItems="flex-end" flex={1}>
                            <Text color={getStockValueColor(totalValue)} fontSize={16} fontWeight="900" fontFamily="$body">
                              ${totalValue.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Text>
                          </YStack>
                          <Button
                            icon={<MaterialIcons name="close" size={16} color={isDark ? '#fff' : '#000'} />}
                            circular
                            {...iconButtonStyle}
                            marginLeft="$3"
                            pressStyle={{ opacity: 0.7 }}
                            backgroundColor="transparent"
                            onPress={() => {
                              if (Platform.OS === 'web') {
                                if (window.confirm('Are you sure you want to delete this stock from your portfolio?')) {
                                  removeFromPortfolio(stock.symbol)
                                }
                              } else {
                                Alert.alert(
                                  'Delete Stock',
                                  'Are you sure you want to delete this stock from your portfolio?',
                                  [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Yes', onPress: () => removeFromPortfolio(stock.symbol) },
                                  ]
                                )
                              }
                            }}
                          />
                        </XStack>
                        <XStack
                          justifyContent="space-between"
                          backgroundColor={isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.03)'}
                          br={8}
                          padding={Platform.OS === 'web' ? '$1.5' : '$1'}
                          mt="$0.5"
                          height={isWeb ? undefined : 40}
                        >
                          <YStack alignItems="center" flex={1}>
                            <Text color={isDark ? '#999' : '#666'} fontSize={11} fontWeight="500" fontFamily="$body">
                              1D
                            </Text>
                            <Text
                              color={
                                stockHistoricalData?.['1d']
                                  ? getStockValueColor(currentPrice - (stockHistoricalData['1d'] || 0))
                                  : isDark
                                  ? '#777'
                                  : '#999'
                              }
                              fontSize={isWeb ? 16 : 14}
                              fontWeight="600"
                              fontFamily="$body"
                            >
                              {stockHistoricalData?.['1d'] ? calculateReturn(currentPrice, stockHistoricalData['1d']) : '-'}
                            </Text>
                          </YStack>
                          <YStack alignItems="center" flex={1}>
                            <Text color={isDark ? '#999' : '#666'} fontSize={11} fontWeight="500" fontFamily="$body">
                              1W
                            </Text>
                            <Text
                              color={
                                stockHistoricalData?.['1w']
                                  ? getStockValueColor(currentPrice - (stockHistoricalData['1w'] || 0))
                                  : isDark
                                  ? '#777'
                                  : '#999'
                              }
                              fontSize={isWeb ? 16 : 14}
                              fontWeight="600"
                              fontFamily="$body"
                            >
                              {stockHistoricalData?.['1w'] ? calculateReturn(currentPrice, stockHistoricalData['1w']) : '-'}
                            </Text>
                          </YStack>
                          <YStack alignItems="center" flex={1}>
                            <Text color={isDark ? '#999' : '#666'} fontSize={12} fontWeight="500" fontFamily="$body">
                              3M
                            </Text>
                            <Text
                              color={
                                stockHistoricalData?.['3m']
                                  ? getStockValueColor(currentPrice - (stockHistoricalData['3m'] || 0))
                                  : isDark
                                  ? '#777'
                                  : '#999'
                              }
                              fontSize={isWeb ? 16 : 14}
                              fontWeight="600"
                              fontFamily="$body"
                            >
                              {stockHistoricalData?.['3m'] ? calculateReturn(currentPrice, stockHistoricalData['3m']) : '-'}
                            </Text>
                          </YStack>
                          <YStack alignItems="center" flex={1}>
                            <Text color={isDark ? '#999' : '#666'} fontSize={12} fontWeight="500" fontFamily="$body">
                              1Y
                            </Text>
                            <Text
                              color={
                                stockHistoricalData?.['1y']
                                  ? getStockValueColor(currentPrice - (stockHistoricalData['1y'] || 0))
                                  : isDark
                                  ? '#777'
                                  : '#999'
                              }
                              fontSize={isWeb ? 16 : 14}
                              fontWeight="600"
                              fontFamily="$body"
                            >
                              {stockHistoricalData?.['1y'] ? calculateReturn(currentPrice, stockHistoricalData['1y']) : '-'}
                            </Text>
                          </YStack>
                        </XStack>
                      </YStack>
                    </Animated.View>
                  )
                })
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
