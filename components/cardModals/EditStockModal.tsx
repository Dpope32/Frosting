import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { debounce } from 'lodash'
import { YStack, Text, Button, XStack, ScrollView, useTheme, Input } from 'tamagui'
import { Platform, useColorScheme, StyleSheet, Vibration, TextInput, TouchableOpacity } from 'react-native'
import { StockCardAnimated } from '../baseModals/StockCardAnimated'
import { useUserStore } from '@/store/UserStore'
import { Stock } from '@/types/stocks'
import { portfolioData, updatePortfolioData } from '@/utils/Portfolio'
import { useQueryClient } from '@tanstack/react-query'
import { useEditStockStore } from '@/store/EditStockStore'
import { useToastStore } from '@/store/ToastStore'
import { initializeStocksData, searchStocks } from '@/services/stockSearchService'
import { StockData } from '@/constants/stocks'
import { getIconForStock } from '../../constants/popularStocks'
import { DebouncedInput, DebouncedInputHandle } from '@/components/shared/debouncedInput'
import { MaterialIcons } from '@expo/vector-icons'

export function EditStockModal() {
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

export function StockEditorModal({ open, onOpenChange, stock }: StockEditorModalProps) {
  const [formData, setFormData] = useState({ ticker: '', quantity: '', name: ''})
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [stocksInitialized, setStocksInitialized] = useState(false)
  const [dropdownActive, setDropdownActive] = useState(false)
  const [hasExplicitSelection, setHasExplicitSelection] = useState(false)
  const [isQuantityFocused, setIsQuantityFocused] = useState(false)
  const [isQuantityEditMode, setIsQuantityEditMode] = useState(false)
  // Add this to prevent blur from closing dropdown during selection
  const [isSelectingStock, setIsSelectingStock] = useState(false)

  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = useTheme()
  const showToast = useToastStore((state) => state.showToast)
  const tickerInputRef = useRef<DebouncedInputHandle>(null)
  const quantityInputRef = useRef<TextInput>(null)

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
      setIsQuantityEditMode(true)
    }
  }, [open, stocksInitialized])

  useEffect(() => {
    if (stock) {
      setFormData({
        ticker: stock.symbol,
        quantity: stock.quantity.toString(),
        name: stock.name
      })
      setHasExplicitSelection(true)
    } else {
      setFormData({ ticker: '', quantity: '', name: '' })
      setHasExplicitSelection(false)
    }
    setError('')
    setSearchResults([])
    setDropdownActive(false)
  }, [stock, open])

  const queryClient = useQueryClient()

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length > 0) {
        // If we have an exact match that was explicitly selected, don't show any results
        if (hasExplicitSelection && query.toUpperCase() === formData.ticker) {
          setSearchResults([])
          setDropdownActive(false)
          return
        }

        const results = searchStocks(query, 10, true)
        setSearchResults(results)
        
        // Only set dropdown active if we have results and no explicit selection
        setDropdownActive(results.length > 0 && !hasExplicitSelection)
      } else {
        setSearchResults([])
        setDropdownActive(false)
      }
    }, 300),
    [stocksInitialized, hasExplicitSelection, formData.ticker]
  )

  const handleTickerChange = useCallback((value: string) => {
    // Update ticker field
    setFormData(prev => ({ ...prev, ticker: value }))
    
    // If user is typing, they're making a new choice, clear any previous selection
    if (hasExplicitSelection) {
      // Only clear the name if they're changing the ticker from a previous selection
      setFormData(prev => ({ 
        ...prev, 
        ticker: value,
        name: '' 
      }))
      setHasExplicitSelection(false)
    } else {
      setFormData(prev => ({ ...prev, ticker: value }))
    }
    
    setError('')

    // Search for stocks if not editing an existing stock
    if (!stock) {
      debouncedSearch(value)
    }
  }, [stock, debouncedSearch, hasExplicitSelection])

  const handleQuantityChange = useCallback((value: string) => {
    // Only allow numeric input for quantity
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({ ...prev, quantity: numericValue }))
    setError('')
  }, [])

  // Handle quantity input focus
  const handleQuantityFocus = useCallback(() => {
    setIsQuantityFocused(true)
    setIsQuantityEditMode(true)
  }, [])

  // Handle quantity input blur
  const handleQuantityBlur = useCallback(() => {
    setIsQuantityFocused(false)
    // Only exit edit mode if there's a value
    if (formData.quantity) {
      setIsQuantityEditMode(false)
    }
  }, [formData.quantity])

  // Handle ticker input focus
  const handleTickerFocus = useCallback(() => {
    setIsQuantityFocused(false)
    // Only show dropdown if we don't have an explicit selection and have results
    if (!stock && !hasExplicitSelection && formData.ticker.trim() && searchResults.length > 0) {
      setDropdownActive(true)
    }
  }, [stock, formData.ticker, searchResults.length, hasExplicitSelection])

  // Handle selecting a stock from search results
  const handleSelectStock = useCallback((selectedStockData: StockData) => {
    // Mark that we're in the process of selecting to prevent dropdown from closing
    setIsSelectingStock(true);
    
    // Cancel any pending searches
    debouncedSearch.cancel();

    // Immediately update the form data
    setFormData({
      ticker: selectedStockData.symbol,
      quantity: formData.quantity,
      name: selectedStockData.name
    });
    
    // Mark that we have an explicit selection
    setHasExplicitSelection(true);
    
    // Close the dropdown after a slight delay to ensure the selection is processed
    setTimeout(() => {
      setDropdownActive(false);
      setIsSelectingStock(false);
      
      // Only blur after selection is complete
      if (Platform.OS !== 'web') {
        if (tickerInputRef.current?.blur) {
          tickerInputRef.current.blur();
        }
      }
    }, 100);
    
  }, [debouncedSearch, formData.quantity]);

  // Handle removing a selected stock
  const handleRemoveStock = useCallback(() => {
    setFormData(prev => ({ ...prev, ticker: '', name: '' }))
    setHasExplicitSelection(false)
    setDropdownActive(false)
    // Allow time for state to update before attempting to focus
    setTimeout(() => {
      if (tickerInputRef.current?.focus) {
        tickerInputRef.current.focus()
      }
    }, 150)
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

      // Show success message
      setError('')

      // Show toast only when adding a new stock
      if (!stock) {
        showToast('Successfully added stock!')
      }

      // Add haptic feedback on mobile
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100)
      }

      // Close the modal
      onOpenChange(false)
    } catch (err) {
      setError('Failed to update portfolio. Please try again.')
    }
  }, [formData, stock, onOpenChange, queryClient, showToast])

  const handleDelete = useCallback(() => {
    if (!stock) return

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete ${stock.symbol} from your portfolio?`)) {
        const updatedPortfolio = portfolioData.filter(s => s.symbol !== stock.symbol)
        updatePortfolioData(updatedPortfolio)
        queryClient.invalidateQueries({ queryKey: ['stock-prices'] })
        onOpenChange(false)
      }
    } else {
      // For mobile, you might want to use Alert here
      const updatedPortfolio = portfolioData.filter(s => s.symbol !== stock.symbol)
      updatePortfolioData(updatedPortfolio)
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] })
      onOpenChange(false)
    }
  }, [stock, onOpenChange, queryClient])

  const handleInputBlur = useCallback(() => {
    // Don't close dropdown if we're in the process of selecting a stock
    if (isSelectingStock) return;
    
    // Use a small delay to allow selection to complete before hiding dropdown
    setTimeout(() => {
      setDropdownActive(false)
    }, 300)
  }, [isSelectingStock])

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
    backgroundColor: "rgba(0,0,0,0.20)",
    color: "$color",
    fontSize: 14,
    height: 40,
    px: "$2",
    py: "$2",
  }), [])

  const modalTitle = stock
    ? `Edit Holdings for ${stock.symbol}`
    : 'Add New Stock'

  // Ensure the modal closes when the close button is clicked
  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  // Function to adjust color brightness
  const adjustColor = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])

  // Function to handle stock selection row click
  const handleStockRowPress = useCallback((selectedStockData: StockData) => {
    // Use the same logic as handleSelectStock
    handleSelectStock(selectedStockData);
  }, [handleSelectStock]);

  return (
    <StockCardAnimated
      open={open}
      onClose={handleClose}
      title={modalTitle}
      showCloseButton={true}
    >
      <YStack mb="$2" gap="$2" px="$2">
        {!stock && (
          <YStack>
            {hasExplicitSelection ? (
              <XStack 
                alignItems="center" 
                justifyContent="space-between"
                backgroundColor={formData.quantity ? (isDark ?  "rgba(4, 4, 4, 0.91)" : "rgba(255,255,255,0.8)") : "transparent"}
                br={formData.quantity ? 12 : 0}
                px={formData.quantity ? "$1" : "$0"}
                py={formData.quantity ? "$1" : "$0"}
                borderWidth={formData.quantity ? 1 : 0}
                borderColor={formData.quantity ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") : "transparent"}
              >
                <YStack gap="$1" flex={1}>
                  <XStack mb="$-2" alignItems="center" justifyContent="space-between" px="$2">
                    <XStack jc="center" alignItems="center" gap="$1">
                      <XStack
                        width={28}
                        height={28}
                        br={14}
                        backgroundColor="transparent"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {renderStockIcon(formData.ticker, 16, isDark ? "#f7f7f7" : theme.color10.get())}
                      </XStack>
                      <Text fontSize={16} fontWeight="500">{formData.name}</Text>
                    </XStack>
                    {formData.quantity && (
                      <Button
                        backgroundColor="transparent"
                        onPress={() => {
                          setIsQuantityEditMode(true)
                          setTimeout(() => {
                            quantityInputRef.current?.focus()
                          }, 100)
                        }}
                      >
                        <MaterialIcons 
                          name="edit" 
                          size={18} 
                          color={isDark ? "#f7f7f7" : "$color12"} 
                        />
                      </Button>
                    )}
                  </XStack>
                  
                  <XStack mt="$-1" px="$4" alignItems="center" justifyContent="space-between">
                    {formData.quantity && (
                      <Text fontSize={14} color={isDark ? "$color11" : "$color10"}>
                        {formData.quantity} shares
                      </Text>
                    )}
                    <Button
                      backgroundColor="transparent"
                      br={4}
                      px="$2"
                      onPress={handleRemoveStock}
                    >
                      <Text color="$red10" fontSize={12} fontWeight="500">Remove</Text>
                    </Button>
                  </XStack>
                </YStack>
              </XStack>
            ) : (
              <>
                <YStack>
                  <XStack alignItems="center" gap="$2" pb="$2" justifyContent="space-between" width="100%">
                    {isQuantityEditMode ? (
                      <Input
                        ref={quantityInputRef}
                        value={formData.quantity}
                        onChangeText={handleQuantityChange}
                        placeholder="# Shares"
                        placeholderTextColor={isDark ? "#333" : "#777"}
                        keyboardType="numeric"
                        width={90}
                        onFocus={handleQuantityFocus}
                        onBlur={handleQuantityBlur}
                        {...inputStyle}
                      />
                    ) : (
                      <XStack 
                        alignItems="center" 
                        width="100%"
                        justifyContent="space-between"
                        px="$3"
                      >
                        <Text 
                          color={isDark ? "#f7f7f7" : "$color12"} 
                          fontSize={16} 
                          fontWeight="500"
                        >
                          {formData.quantity ? `${formData.quantity} shares` : 'Enter shares'}
                        </Text>
                        <Button
                          backgroundColor="transparent"
                          onPress={() => {
                            setIsQuantityEditMode(true)
                            setTimeout(() => {
                              quantityInputRef.current?.focus()
                            }, 100)
                          }}
                        >
                          <MaterialIcons 
                            name="edit" 
                            size={18} 
                            color={isDark ? "#f7f7f7" : "$color12"} 
                          />
                        </Button>
                      </XStack>
                    )}
                  </XStack>
                </YStack>
                <DebouncedInput
                  ref={tickerInputRef} 
                  value={formData.ticker}
                  onDebouncedChange={handleTickerChange}
                  placeholder="Start typing to search"
                  width={300}
                  placeholderTextColor={isDark ? "#333" : "#777"}
                  autoCapitalize="characters"
                  fontFamily="$body"
                  onFocus={handleTickerFocus}
                  onBlur={handleInputBlur}
                  {...inputStyle}
                />
              </>
            )}
            {(!hasExplicitSelection && dropdownActive && searchResults.length > 0) && (
              <YStack
                py="$2"
                maxHeight={Platform.OS === 'web' ? 500 : 450}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  <YStack gap="$2">
                    {searchResults.map((result, index) => (
                      <TouchableOpacity 
                        key={`${result.symbol}-${index}`}
                        onPress={() => handleStockRowPress(result)}
                        activeOpacity={0.7}
                      >
                        <XStack
                          backgroundColor={isDark ? "rgba(4, 4, 4, 0.91)" : "rgba(255,255,255,0.8)"}
                          br={8}
                          padding="$2"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <XStack alignItems="center" gap="$2" flex={1}>
                            <XStack
                              width={32}
                              height={32}
                              br={16}
                              backgroundColor={isDark ?  "rgba(4, 4, 4, 0.91)" : "rgba(255,255,255,0.8)"}
                              alignItems="center"
                              justifyContent="center"
                            >
                              {renderStockIcon(result.symbol, 18, isDark ? "#f7f7f7" : theme.color10.get())}
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
                          <Text color="$blue10" fontSize={12} fontWeight="500">
                            Select
                          </Text>
                        </XStack>
                      </TouchableOpacity>
                    ))}
                  </YStack>
                </ScrollView>
              </YStack>
            )}
          </YStack>
        )}

        {error && (
          <Text
            color="$red10"
            fontSize={12}
            textAlign="center"
            backgroundColor="$red2"
            padding="$2"
            br={6}
          >
            {error}
          </Text>
        )}
      </YStack>
      <XStack gap="$2" py="$2.5" px="$2" justifyContent="space-between">
          <Button
            backgroundColor={isDark ? `${primaryColor}40` : `${adjustColor(primaryColor, 20)}80`}
            height={40}
            flex={1}
            br={8}
            opacity={!formData.ticker || !formData.quantity || !formData.name ? 0.5 : 1}
            disabled={!formData.ticker || !formData.quantity || !formData.name}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            onPress={handleSave}
            borderWidth={2}
            borderColor={primaryColor}
          >
            <Text color={isDark ? "#f7f7f7" : adjustColor(primaryColor, -100)} fontWeight="600" fontSize={14}>
              {stock ? 'Update' : 'Add Stock'}
            </Text>
          </Button>

          {stock && (
            <Button
              backgroundColor={isDark ? "$red8" : "$red6"}
              height={40}
              width={40}
              br={8}
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              onPress={handleDelete}
            >
              <MaterialIcons name="delete" size={20} color="#f7f7f7" />
            </Button>
          )}
        </XStack>
    </StockCardAnimated>
  )
}