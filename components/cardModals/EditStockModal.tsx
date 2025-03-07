import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { YStack, Text, Input, Button, XStack, ScrollView, useTheme } from 'tamagui'
import { useColorScheme } from 'react-native'
import { BaseCardModal } from './BaseCardModal'
import { useUserStore } from '@/store/UserStore'
import { Stock } from '@/types'
import { portfolioData, updatePortfolioData } from '@/utils/Portfolio'
import { useQueryClient } from '@tanstack/react-query'
import { useEditStockStore } from '@/store/EditStockStore'
import { initializeStocksData,  searchStocks } from '@/services/stockSearchService'
import { StockData } from '@/constants/stocks'
import { getIconForStock} from '../../constants/popularStocks'

// Global edit stock modal component
export function EditStockModal() {
  // Get state from the edit stock store
  const isOpen = useEditStockStore(s => s.isOpen)
  const selectedStock = useEditStockStore(s => s.selectedStock)
  const closeModal = useEditStockStore(s => s.closeModal)
  
  return (
    <StockEditorModal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}
      stock={selectedStock}
    />
  )
}

// Individual stock editor modal component
interface StockEditorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock?: Stock
}

function StockEditorModal({ open, onOpenChange, stock }: StockEditorModalProps) {
  const [formData, setFormData] = useState({ ticker: '', quantity: '', name: ''})
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [stocksInitialized, setStocksInitialized] = useState(false)
  
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = useTheme()

  // Initialize stocks data when modal opens
  useEffect(() => {
    const initStocks = async () => {
      try {
        if (!stocksInitialized) {
          await initializeStocksData()
          setStocksInitialized(true)
        }
      } catch (error) {
        console.error('Failed to initialize stocks data:', error)
      }
    }
    
    if (open) {
      initStocks()
    }
  }, [open, stocksInitialized])

  useEffect(() => {
    if (stock) {
      setFormData({
        ticker: stock.symbol,
        quantity: stock.quantity.toString(),
        name: stock.name
      })
    } else {
      setFormData({ ticker: '', quantity: '', name: '' })
    }
    setError('')
    setSearchResults([])
  }, [stock, open])

  const queryClient = useQueryClient()
  
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length > 0) {
        const results = searchStocks(query, 10)
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    }, 300),
    [stocksInitialized]
  )

  const handleTickerChange = useCallback((value: string) => {
    // Update ticker field
    setFormData(prev => ({ ...prev, ticker: value }))
    setError('')
    
    // Search for stocks if not editing an existing stock
    if (!stock) {
      debouncedSearch(value)
    }
  }, [stock, debouncedSearch])
  
  const handleQuantityChange = useCallback((value: string) => {
    // Only allow numeric input for quantity
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({ ...prev, quantity: numericValue }))
    setError('')
  }, [])

  // Handle selecting a stock from search results
  const handleSelectStock = useCallback((selectedStock: StockData) => {
    setFormData(prev => ({
      ...prev,
      ticker: selectedStock.symbol,
      name: selectedStock.name
    }))
    setSearchResults([])
  }, [])

  const handleSave = useCallback(() => {
    try {
      if (!formData.ticker || !formData.quantity || !formData.name) {
        setError('All fields are required')
        return
      }

      const quantityNum = Number(formData.quantity)
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError('Please enter a valid quantity')
        return
      }

      const newStock: Stock = {
        symbol: formData.ticker.toUpperCase(),
        quantity: quantityNum,
        name: formData.name
      }

      const updatedPortfolio = stock
        ? portfolioData.map(s => s.symbol === stock.symbol ? newStock : s)
        : [...portfolioData, newStock]

      updatePortfolioData(updatedPortfolio)
      // Invalidate and refetch portfolio data
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] })
      onOpenChange(false)
    } catch (err) {
      setError('Failed to update portfolio. Please try again.')
    }
  }, [formData, stock, onOpenChange, queryClient])

  // Render stock icon helper function
  const renderStockIcon = useCallback((symbol: string, size: number, color: string) => {
    try {
      const iconData = getIconForStock(symbol)
      const { Component, type } = iconData
      if (type === 'lucide') {
        return <Component size={size} color={color} />
      } else if (type === 'brand' || type === 'solid') {
        return <Component name={iconData.name} size={size} color={color} />
      } else if (type === 'material') {
        return <Component name={iconData.name} size={size} color={color} />
      }
      return <Text fontSize={size} color={color}>$</Text>
    } catch (err) {
      console.error(`Error rendering icon for ${symbol}:`, err)
      return <Text fontSize={size} color={color}>$</Text>
    }
  }, [])

  const inputStyle = useMemo(() => ({
    backgroundColor: "$backgroundHover",
    borderColor: "$borderColor",
    color: "$color",
    fontSize: 14,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: "$2",
  }), [])

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={stock ? 'Edit Stock' : 'Add Stock'}
      zIndex={200000}
    >
      <YStack gap="$3" paddingVertical="$2">
        <YStack>
          <Text color="$colorSubdued" fontFamily="$body" fontSize={12} marginBottom="$1">
            Ticker Symbol
          </Text>
          <Input
            value={formData.ticker}
            onChangeText={handleTickerChange}
            placeholder="e.g. AAPL or search by name"
            placeholderTextColor="$color11"
            autoCapitalize="characters"
            disabled={!!stock}
            opacity={!!stock ? 0.6 : 1}
             fontFamily="$body"
            {...inputStyle}
          />
          
          {/* Search Results */}
          {searchResults.length > 0 && !stock && (
            <YStack 
              backgroundColor={isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"}
              borderRadius={8}
              padding="$2"
              marginTop="$1"
              maxHeight={200}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <YStack gap="$2">
                  {searchResults.map(result => (
                    <XStack
                      key={result.symbol}
                      backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)"}
                      borderRadius={8}
                      padding="$2"
                      alignItems="center"
                      justifyContent="space-between"
                      pressStyle={{ opacity: 0.7 }}
                      onPress={() => handleSelectStock(result)}
                    >
                      <XStack alignItems="center" gap="$2" flex={1}>
                        <XStack
                          width={32}
                          height={32}
                          borderRadius={16}
                          backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {renderStockIcon(result.symbol, 16, isDark ? theme.color11.get() : theme.color10.get())}
                        </XStack>
                        <YStack>
                          <Text color={isDark ? "$color" : "$color12"} fontWeight="600" fontSize={14} fontFamily="$body">
                            {result.symbol}
                          </Text>
                          <Text color={isDark ? "$color11" : "$color10"} fontSize={12} fontFamily="$body" numberOfLines={1}>
                            {result.name}
                          </Text>
                        </YStack>
                      </XStack>
                      <Button
                        size="$2"
                        backgroundColor={primaryColor}
                        borderRadius={4}
                        paddingHorizontal="$2"
                        onPress={() => handleSelectStock(result)}
                      >
                        <Text color="#fff" fontSize={12} fontWeight="500">
                          Select
                        </Text>
                      </Button>
                    </XStack>
                  ))}
                </YStack>
              </ScrollView>
            </YStack>
          )}
        </YStack>

        <YStack>
          <Text color="$colorSubdued"  fontFamily="$body" fontSize={12} marginBottom="$1">
            Quantity
          </Text>
          <Input
            value={formData.quantity}
            onChangeText={handleQuantityChange}
            placeholder="Number of shares"
            placeholderTextColor="$color11"
            keyboardType="numeric"
            {...inputStyle}
          />
        </YStack>

        <YStack>
          <Text color="$colorSubdued"  fontFamily="$body" fontSize={12} marginBottom="$1">
            Company Name
          </Text>
          <Input
            value={formData.name}
            onChangeText={() => {}}
            placeholder="e.g. Apple Inc"
            placeholderTextColor="$color11"
            disabled={true}
            opacity={0.6}
             fontFamily="$body"
            {...inputStyle}
          />
        </YStack>

        {error && (
          <Text 
            color="$red10" 
            fontSize={12} 
            textAlign="center"
            backgroundColor="$red2"
            padding="$2"
            borderRadius={6}
          >
            {error}
          </Text>
        )}

        <Button
          backgroundColor={primaryColor}
          height={40}
          borderRadius={8}
          opacity={!formData.ticker || !formData.quantity || !formData.name ? 0.5 : 1}
          disabled={!formData.ticker || !formData.quantity || !formData.name}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          onPress={handleSave}
        >
          <Text color="#fff" fontWeight="500" fontSize={14}>
            {stock ? 'Update Stock' : 'Add Stock'}
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  )
}
