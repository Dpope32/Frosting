import React, { useState, useEffect } from 'react'
import { useColorScheme, StyleSheet, Platform } from 'react-native'
import { YStack, Text, XStack, Input, isWeb } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { usePortfolioStore, updatePrincipal } from '@/store/PortfolioStore'
import { useEditStockStore } from '@/store/EditStockStore'
import { getValueColor } from '@/constants/valueHelper'
import Animated, { FadeIn } from 'react-native-reanimated'
import { HoldingsCards } from '@/components/modals/HoldingsCards'

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
  const { totalValue, principal } = usePortfolioStore()
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
  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? 'rgb(15, 15, 15)' : 'rgba(231, 231, 231, 0.8)',
      borderRadius: 12,
      paddingVertical: Platform.OS === 'web' ? 10 : 12,
      paddingHorizontal: Platform.OS === 'web' ? 10 : 4,
      borderWidth: 1,
      borderColor: isDark ? '#111' : 'rgba(0, 0, 0, 0.1)',
    },
  })
  const calculateROI = () => {
    if (!principal || principal === 0) return 0
    return ((currentTotalValue - principal) / principal) * 100
  }
  const roi = calculateROI()
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
      snapPoints={Platform.OS === 'web' ? [85] : [85]}
      showCloseButton={true}
      hideHandle={true}
    >
      <YStack
        gap={Platform.OS === 'web' ? '$2' : '$2'}
        paddingTop={Platform.OS === 'web' ? 0 : '$1'}
        paddingBottom={Platform.OS === 'web' ? '$5' : '$2'}
      >
        <YStack>
          <Animated.View entering={FadeIn.duration(600)} style={[styles.card, webCardStyle]}>
            <YStack gap={isWeb ? '$4' : '$2'} px="$3">
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
                  ${currentTotalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                    -${principal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
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
        <HoldingsCards 
          closePortfolioModal={closePortfolioModal} 
          openEditStockModal={openEditStockModal} 
        />
      </YStack>
    </BaseCardModal>
  )
}
