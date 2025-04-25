import React from 'react'
import { Text, XStack, YStack, Input } from 'tamagui'
import { isIpad } from '@/utils/deviceUtils'
import { isWeb } from 'tamagui'

interface StockMetricsProps {
  currentTotalValue: number
  principal: number
  isEditingPrincipal: boolean
  principalInput: string
  setIsEditingPrincipal: (value: boolean) => void
  setPrincipalInput: (value: string) => void
  roi: number
  getStockValueColor: (value: number) => string
  isDark: boolean
}

export function StockMetrics({
  currentTotalValue,
  principal,
  isEditingPrincipal,
  principalInput,
  setIsEditingPrincipal,
  setPrincipalInput,
  roi,
  getStockValueColor,
  isDark,
}: StockMetricsProps) {
  return (
    <YStack gap={isWeb ? '$4' : '$2'}>
      <XStack justifyContent="space-between" alignItems="center">
        <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 18 : isIpad() ? 16 : 14} fontFamily="$body">
          Value
        </Text>
        <Text
          color={getStockValueColor(currentTotalValue)}
          fontSize={isWeb ? 18 : isIpad() ? 16 : 14}
          fontWeight="600"
          fontFamily="$body"
        >
          ${currentTotalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </Text>
      </XStack>
      <XStack justifyContent="space-between" alignItems="center">
        <Text color={isDark ? '#999' : '#666'} fontSize={isWeb ? 18 : isIpad() ? 16 : 14} fontFamily="$body">
          Principal
        </Text>
        {isEditingPrincipal ? (
          <Input
            value={principalInput}
            onChangeText={(v: string) => setPrincipalInput(v.replace(/[^0-9.]/g, ''))}
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
  )
} 