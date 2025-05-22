import React from 'react'
import { XStack, YStack, Text, useTheme } from 'tamagui'
import { useColorScheme } from 'react-native'
import { renderStockIcon } from './iconRender'
import { MaterialIcons } from '@expo/vector-icons'

interface StockDisplayProps {
  symbol: string
  name: string
  primaryColor: string
  onRemove?: () => void
  showRemoveButton?: boolean
  quantity?: string | number
  showQuantity?: boolean
}

export function StockDisplay({
  symbol,
  name,
  primaryColor,
  onRemove,
  showRemoveButton = false,
  quantity,
  showQuantity = false
}: StockDisplayProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = useTheme()

  return (
    <XStack 
      alignItems="center" 
      justifyContent="space-between"
      backgroundColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)"}
      borderColor={primaryColor}
      borderWidth={2}
      br={12}
      px="$3"
      py="$3"
    >
      <XStack alignItems="center" gap="$3" flex={1}>
        <XStack
          width={36}
          height={36}
          br={18}
          backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          alignItems="center"
          justifyContent="center"
        >
          {renderStockIcon(symbol, 20, isDark ? "#f7f7f7" : theme.color10.get())}
        </XStack>
        <YStack flex={1}>
          <Text fontSize={16} fontFamily="$body" fontWeight="600" color="$color">
            {symbol}
          </Text>
          <Text fontSize={14} fontFamily="$body" color={isDark ? "$color11" : "$color10"} numberOfLines={1}>
            {name}
          </Text>
        </YStack>
      </XStack>
      
      {showQuantity && quantity && (
        <YStack alignItems="flex-end" mr={showRemoveButton ? "$2" : 0}>
          <Text fontSize={14} fontFamily="$body" color={isDark ? "$color11" : "$color10"}>
            Shares
          </Text>
          <Text fontSize={16} fontFamily="$body" fontWeight="600" color="$color">
            {quantity}
          </Text>
        </YStack>
      )}
      
      {showRemoveButton && onRemove && (
        <XStack>
          <MaterialIcons 
            name="close" 
            size={24} 
            color={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"} 
            onPress={onRemove}
          />
        </XStack>
      )}
    </XStack>
  )
} 