import React from 'react'
import { XStack, YStack, Text, Button, ScrollView, useTheme } from 'tamagui'
import { useColorScheme } from 'react-native'
import { StockData } from '@/constants'
import { renderStockIcon } from './iconRender'

interface StockSearchResultsProps {
  results: StockData[]
  onSelect: (stock: StockData) => void
  primaryColor: string
  visible: boolean
}

export function StockSearchResults({ 
  results, 
  onSelect, 
  primaryColor, 
  visible 
}: StockSearchResultsProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = useTheme()

  if (!visible || results.length === 0) return null

  return (
    <YStack
      backgroundColor={isDark ? "rgba(20, 20, 20, 0.95)" : "rgba(255, 255, 255, 0.95)"}
      borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
      borderWidth={1}
      br={12}
      maxHeight={300}
      overflow="hidden"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack>
          {results.map((result, index) => (
            <XStack
              key={`${result.symbol}-${index}`}
              alignItems="center"
              justifyContent="space-between"
              px="$3"
              py="$3"
              borderBottomWidth={index < results.length - 1 ? 1 : 0}
              borderBottomColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}
              pressStyle={{ 
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
                opacity: 0.8 
              }}
              onPress={() => onSelect(result)}
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
                  {renderStockIcon(result.symbol, 18, isDark ? "#f7f7f7" : theme.color10.get())}
                </XStack>
                <YStack flex={1}>
                  <Text color="$color" fontWeight="600" fontSize={16} fontFamily="$body">
                    {result.symbol}
                  </Text>
                  <Text color={isDark ? "$color11" : "$color10"} fontSize={14} fontFamily="$body" numberOfLines={1}>
                    {result.name}
                  </Text>
                </YStack>
              </XStack>
              <Button
                size="$2"
                backgroundColor={primaryColor}
                br={8}
                px="$3"
                onPress={(e) => {
                  e.preventDefault && e.preventDefault()
                  onSelect(result)
                }}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text color="white" fontSize={14} fontWeight="600">
                  Select
                </Text>
              </Button>
            </XStack>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  )
} 